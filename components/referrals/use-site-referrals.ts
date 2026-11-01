"use client"

import { usePrivy } from "@privy-io/react-auth"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ApiError, fetchMe, fetchReferrals } from "@/lib/referral-site/api"
import { referralUrl } from "@/lib/referral-site/config"
import type { EarningsSeriesRange, EarningsSeriesResponse } from "@/lib/referral-site/types"

const REFRESH_MS = 60_000

type ErrorBody = { error?: { code?: string; message?: string } }

function retryServerErrors(failures: number, error: Error): boolean {
  return failures < 2 && !(error instanceof ApiError && error.status < 500)
}

async function fetchEarningsSeries(
  headers: Record<string, string>,
  range: EarningsSeriesRange,
): Promise<EarningsSeriesResponse> {
  const response = await fetch(`/api/site/earnings-series?range=${range}`, { headers, cache: "no-store" })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = (body as ErrorBody | null)?.error
    throw new ApiError(
      response.status,
      error?.code ?? "error",
      error?.message ?? "The request failed. Try again.",
    )
  }
  return body as EarningsSeriesResponse
}

export function siteReferralLink(code: string): string {
  const origin = (process.env.NEXT_PUBLIC_REFERRAL_SITE_URL ?? window.location.origin).replace(/\/+$/, "")
  return referralUrl(origin, code)
}

export function signupUrl(): string {
  return `${(process.env.NEXT_PUBLIC_REFERRAL_SITE_URL ?? "").replace(/\/+$/, "")}/`
}

export function useSiteSession() {
  const { ready, authenticated, user, login, getAccessToken } = usePrivy()
  const userId = authenticated ? (user?.id ?? null) : null
  const authHeaders = async () => {
    const token = await getAccessToken()
    if (!token) throw new ApiError(401, "unauthorized", "Sign in to continue.")
    return { authorization: `Bearer ${token}` }
  }
  return { ready, userId, login, authHeaders }
}

export function useSiteMe() {
  const { userId, authHeaders } = useSiteSession()
  return useQuery({
    queryKey: ["site", "me", userId],
    queryFn: async () => fetchMe(await authHeaders()),
    enabled: userId !== null,
    retry: retryServerErrors,
  })
}

export function useSiteReferrals() {
  const { userId, authHeaders } = useSiteSession()
  return useQuery({
    queryKey: ["site", "referrals", userId],
    queryFn: async () => fetchReferrals(await authHeaders()),
    enabled: userId !== null,
    refetchInterval: REFRESH_MS,
    retry: retryServerErrors,
  })
}

export function useSiteEarningsSeries(range: EarningsSeriesRange) {
  const { userId, authHeaders } = useSiteSession()
  return useQuery({
    queryKey: ["site", "referrals", "earnings-series", userId, range],
    queryFn: async () => fetchEarningsSeries(await authHeaders(), range),
    enabled: userId !== null,
    refetchInterval: REFRESH_MS,
    placeholderData: keepPreviousData,
    retry: retryServerErrors,
  })
}
