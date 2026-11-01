"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/referral-site/api"
import { useSiteWallet } from "@/lib/referral-site/wallet"

export type EmailPrefs = {
  joined: boolean
  firstTrade: boolean
  unlock: boolean
  boost: boolean
  weeklyOnly: boolean
}

export type EmailSettings = { email: string | null; subscribed: boolean; prefs: EmailPrefs }

export type EmailSettingsUpdate = { email?: string; prefs?: Partial<EmailPrefs> }

const DEFAULT_SETTINGS: EmailSettings = {
  email: null,
  subscribed: false,
  prefs: { joined: true, firstTrade: true, unlock: true, boost: true, weeklyOnly: false },
}

async function call(path: string, init: RequestInit): Promise<EmailSettings> {
  const response = await fetch(path, { ...init, cache: "no-store" })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error
    throw new ApiError(
      response.status,
      error?.code ?? "error",
      error?.message ?? "Couldn’t save that. Try again.",
    )
  }
  return body as EmailSettings
}

const EMAIL_SETTINGS_STALE_MS = 5 * 60_000

function useEmailSettingsQuery() {
  const wallet = useSiteWallet()
  const key = ["site", "email-settings", wallet.address]
  const live = !wallet.demo && wallet.address !== null

  const query = useQuery({
    queryKey: key,
    queryFn: async () => call("/api/site/email/preferences", { headers: await wallet.authHeaders() }),
    enabled: live,
    initialData: live ? undefined : DEFAULT_SETTINGS,
    staleTime: EMAIL_SETTINGS_STALE_MS,
    refetchOnWindowFocus: false,
  })

  return { wallet, key, live, query }
}

export function usePrefetchEmailSettings() {
  useEmailSettingsQuery()
}

export function useEmailSettings() {
  const queryClient = useQueryClient()
  const { wallet, key, live, query } = useEmailSettingsQuery()

  const save = useMutation({
    mutationFn: async (update: EmailSettingsUpdate): Promise<EmailSettings> => {
      const current = query.data ?? DEFAULT_SETTINGS
      const next = {
        email: update.email ?? current.email ?? undefined,
        prefs: { ...current.prefs, ...update.prefs },
      }
      if (!live) return { email: next.email ?? null, subscribed: true, prefs: next.prefs }
      return call("/api/site/email/preferences", {
        method: "PUT",
        headers: { ...(await wallet.authHeaders()), "content-type": "application/json" },
        body: JSON.stringify(next),
      })
    },
    onSuccess: (settings) => queryClient.setQueryData(key, settings),
  })

  return { settings: query.data ?? null, loading: query.isPending && live, save }
}
