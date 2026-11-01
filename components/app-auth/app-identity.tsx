"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useQuery } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { ApiError, fetchMe } from "@/lib/referral-site/api"
import type { SiteMe } from "@/lib/referral-site/types"
import type { AuthHeaders } from "@/lib/referral-site/wallet"

export type Registration = "checking" | "signed-out" | "registered" | "unregistered" | "error"

export type AppIdentity = {
  ready: boolean
  authenticated: boolean
  privyUserId: string | null
  address: string | null
  me: SiteMe | null
  registration: Registration
  authHeaders: () => Promise<AuthHeaders>
}

export const APP_ME_QUERY_KEY = ["app", "site-me"] as const

const AppIdentityContext = createContext<AppIdentity | null>(null)

function retryServerErrors(failures: number, error: Error): boolean {
  return failures < 2 && !(error instanceof ApiError && error.status < 500)
}

function registrationFor(
  ready: boolean,
  authenticated: boolean,
  address: string | null,
  status: "pending" | "error" | "success",
  me: SiteMe | null | undefined,
): Registration {
  if (!ready) return "checking"
  if (!authenticated) return "signed-out"
  if (!address || status === "pending") return "checking"
  if (status === "error") return "error"
  return me ? "registered" : "unregistered"
}

export function AppIdentityProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, getAccessToken } = usePrivy()
  const privyUserId = authenticated ? (user?.id ?? null) : null
  const address = authenticated ? (user?.wallet?.address.toLowerCase() ?? null) : null

  const authHeaders = useCallback(async () => {
    const token = await getAccessToken()
    if (!token) throw new ApiError(401, "unauthorized", "Log in to continue.")
    const headers: AuthHeaders = { authorization: `Bearer ${token}` }
    if (address) headers["x-wallet-address"] = address
    return headers
  }, [getAccessToken, address])

  const query = useQuery({
    queryKey: [...APP_ME_QUERY_KEY, privyUserId, address],
    queryFn: async () => {
      try {
        return await fetchMe(await authHeaders())
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    enabled: privyUserId !== null && address !== null,
    retry: retryServerErrors,
  })

  const me = query.data ?? null
  const registration = registrationFor(ready, authenticated, address, query.status, query.data)

  const value = useMemo(
    () => ({ ready, authenticated, privyUserId, address, me, registration, authHeaders }),
    [ready, authenticated, privyUserId, address, me, registration, authHeaders],
  )

  return <AppIdentityContext.Provider value={value}>{children}</AppIdentityContext.Provider>
}

export function useOptionalAppIdentity(): AppIdentity | null {
  return useContext(AppIdentityContext)
}

export function useAppIdentity(): AppIdentity {
  const identity = useContext(AppIdentityContext)
  if (!identity) throw new Error("useAppIdentity must be used inside AppIdentityProvider")
  return identity
}
