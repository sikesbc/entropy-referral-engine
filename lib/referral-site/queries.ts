"use client"

import { type QueryClient, type QueryKey, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { ApiError, fetchMe, fetchReferrals } from "./api"
import type { ReferralsResponse, SiteMe } from "./types"
import { useSiteWallet } from "./wallet"

const REFERRALS_REFRESH_MS = 60_000
const REFERRALS_STALE_MS = 30_000
const ME_STALE_MS = 5 * 60_000

function retryServerErrors(failures: number, error: Error): boolean {
  return failures < 2 && !(error instanceof ApiError && error.status < 500)
}

export function useMe() {
  const wallet = useSiteWallet()
  return useQuery({
    queryKey: ["site", "me", wallet.address],
    queryFn: async () => fetchMe(await wallet.authHeaders()),
    enabled: !wallet.demo && wallet.address !== null,
    staleTime: ME_STALE_MS,
    refetchOnWindowFocus: false,
    retry: retryServerErrors,
  })
}

export function useReferrals() {
  const wallet = useSiteWallet()
  return useQuery({
    queryKey: ["site", "referrals", wallet.address],
    queryFn: async () => fetchReferrals(await wallet.authHeaders()),
    enabled: !wallet.demo && wallet.address !== null,
    staleTime: REFERRALS_STALE_MS,
    refetchInterval: REFERRALS_REFRESH_MS,
    retry: retryServerErrors,
  })
}

const CACHE_PREFIX = "entropy:site-cache:v1:"
const CACHE_LAST = `${CACHE_PREFIX}last`
const CACHE_MAX_AGE_MS = 24 * 60 * 60_000
const PERSISTED_KINDS = ["me", "referrals", "email-settings"] as const

type PersistedKind = (typeof PERSISTED_KINDS)[number]
type PersistedEntry = { data: unknown; updatedAt: number }
type PersistedRecord = {
  address: string
  session: string
  savedAt: number
  entries: Partial<Record<PersistedKind, PersistedEntry>>
}

export type CachedSession = { address: string; me: SiteMe; referrals: ReferralsResponse | null }

function privySession(): string | null {
  const raw = window.localStorage.getItem("privy:token")
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    const token = typeof parsed === "string" ? parsed : raw
    const payload = token.split(".")[1]
    if (!payload) return null
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: unknown }
    return typeof claims.sub === "string" ? claims.sub : null
  } catch {
    return null
  }
}

function readRecord(address: string): PersistedRecord | null {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + address)
    if (!raw) return null
    const record = JSON.parse(raw) as PersistedRecord
    if (record.address !== address || Date.now() - record.savedAt > CACHE_MAX_AGE_MS) return null
    return record
  } catch {
    return null
  }
}

function forgetAll() {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(CACHE_PREFIX)) window.localStorage.removeItem(key)
    }
  } catch {}
}

let restored: { record: PersistedRecord | null } | null = null

function restoredRecord(): PersistedRecord | null {
  if (restored) return restored.record
  let record: PersistedRecord | null = null
  try {
    const address = window.localStorage.getItem(CACHE_LAST)
    const session = privySession()
    const candidate = address ? readRecord(address) : null
    record = candidate && session && candidate.session === session ? candidate : null
  } catch {}
  restored = { record }
  return record
}

function persistedKind(key: QueryKey): { kind: PersistedKind; address: string } | null {
  const [scope, kind, address] = key
  if (scope !== "site" || typeof address !== "string") return null
  if (!PERSISTED_KINDS.includes(kind as PersistedKind)) return null
  return { kind: kind as PersistedKind, address }
}

function writeEntry(address: string, kind: PersistedKind, entry: PersistedEntry) {
  const session = privySession()
  if (!session) return
  try {
    const current = readRecord(address)
    const base = current && current.session === session ? current.entries : {}
    const record: PersistedRecord = {
      address,
      session,
      savedAt: Date.now(),
      entries: { ...base, [kind]: entry },
    }
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(CACHE_PREFIX) && key !== CACHE_LAST && key !== CACHE_PREFIX + address) {
        window.localStorage.removeItem(key)
      }
    }
    window.localStorage.setItem(CACHE_PREFIX + address, JSON.stringify(record))
    window.localStorage.setItem(CACHE_LAST, address)
  } catch {}
}

function restoreInto(queryClient: QueryClient) {
  const record = restoredRecord()
  if (!record) return
  for (const kind of PERSISTED_KINDS) {
    const entry = record.entries[kind]
    if (!entry) continue
    const key = ["site", kind, record.address]
    if (queryClient.getQueryData(key) !== undefined) continue
    queryClient.setQueryData(key, entry.data, { updatedAt: entry.updatedAt })
  }
}

export function useSiteQueryPersistence() {
  const queryClient = useQueryClient()
  const wallet = useSiteWallet()
  const { demo, ready, address } = wallet

  useState(() => {
    if (typeof window !== "undefined" && !demo) restoreInto(queryClient)
    return null
  })

  useEffect(() => {
    if (demo) return
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "success") return
      const target = persistedKind(event.query.queryKey)
      if (!target) return
      writeEntry(target.address, target.kind, {
        data: event.query.state.data,
        updatedAt: event.query.state.dataUpdatedAt,
      })
    })
  }, [demo, queryClient])

  useEffect(() => {
    if (demo || !ready || address) return
    forgetAll()
    restored = { record: null }
  }, [demo, ready, address])
}

const noSubscribe = () => () => {}

export function useCachedSession(): CachedSession | null {
  const wallet = useSiteWallet()
  const record = useSyncExternalStore(
    noSubscribe,
    () => (wallet.demo ? null : restoredRecord()),
    () => null,
  )
  return useMemo(() => {
    if (!record || wallet.ready) return null
    const me = record.entries.me?.data as SiteMe | undefined
    if (!me) return null
    const referrals = (record.entries.referrals?.data as ReferralsResponse | undefined) ?? null
    return { address: record.address, me, referrals }
  }, [record, wallet.ready])
}
