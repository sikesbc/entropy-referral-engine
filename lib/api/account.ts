"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/lib/auth/auth-context"
import type { Session } from "@/lib/auth/types"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { apiGet, apiPost } from "./client"
import { useClearinghouseState, useSpotClearinghouseState } from "./hyperliquid"
import { POLL } from "./polling"
import type {
  AccountMeResponse,
  AccountSyncResponse,
  CompleteOnboardingRequest,
  FollowingResponse,
  GeoStatusResponse,
  TradingAttestationResponse,
  UsernameAvailabilityResponse,
} from "./types/account"

export const accountKeys = {
  all: ["account"] as const,
  me: () => [...accountKeys.all, "me"] as const,
  attestation: () => [...accountKeys.all, "trading-attestation"] as const,
  following: () => [...accountKeys.all, "following"] as const,
  geo: () => ["geo", "status"] as const,
  usernameAvailability: (username: string) =>
    [...accountKeys.all, "username-availability", username] as const,
}

export const fetchAccount = () => apiGet<AccountMeResponse>("/api/account/me")
export const fetchTradingAttestation = () =>
  apiGet<TradingAttestationResponse>("/api/compliance/trading-attestation")
export const fetchFollowing = () => apiGet<FollowingResponse>("/api/me/following")
export const fetchGeoStatus = () => apiGet<GeoStatusResponse>("/api/geo/status")
export const syncAccount = () => apiPost<AccountSyncResponse>("/api/account/sync", {})
export const fetchUsernameAvailability = (username: string) =>
  apiGet<UsernameAvailabilityResponse>("/api/account/username-availability", { username })
export const completeOnboarding = (request: CompleteOnboardingRequest) =>
  apiPost<Session>("/api/account/onboarding", request)

export function useAccount() {
  const { isSignedIn } = useSession()
  return useQuery({ queryKey: accountKeys.me(), queryFn: fetchAccount, enabled: isSignedIn })
}

export function useTradingAttestation() {
  const { isSignedIn } = useSession()
  return useQuery({
    queryKey: accountKeys.attestation(),
    queryFn: fetchTradingAttestation,
    enabled: isSignedIn,
  })
}

export function useFollowing() {
  const { isSignedIn } = useSession()
  return useQuery({ queryKey: accountKeys.following(), queryFn: fetchFollowing, enabled: isSignedIn })
}

export function useGeoStatus() {
  return useQuery({ queryKey: accountKeys.geo(), queryFn: fetchGeoStatus, staleTime: 10 * 60_000 })
}

export function useSyncAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: syncAccount,
    onSuccess: (data) => queryClient.setQueryData(accountKeys.me(), data),
  })
}

export function useUsernameAvailability(username: string, { enabled }: { enabled: boolean }) {
  const { isSignedIn } = useSession()
  return useQuery({
    queryKey: accountKeys.usernameAvailability(username),
    queryFn: () => fetchUsernameAvailability(username),
    enabled: isSignedIn && enabled,
    staleTime: 30_000,
    retry: false,
  })
}

export function useCompleteOnboarding() {
  return useMutation({ mutationFn: completeOnboarding })
}

export type HeaderBalances = { portfolio: number | null; cash: number | null }

export function useHeaderBalances(): HeaderBalances {
  const { user } = useSession()
  const address = user?.walletAddress ?? ""
  const refetchInterval = usePollingInterval(POLL.account)
  const perp = useClearinghouseState(address, "", { refetchInterval })
  const spot = useSpotClearinghouseState(address, { refetchInterval })
  if (!perp.data) return { portfolio: null, cash: null }
  const cash = Number(perp.data.withdrawable)
  const spotTotal = (spot.data?.balances ?? []).reduce((sum, balance) => sum + Number(balance.entryNtl), 0)
  const equity = Number(perp.data.marginSummary.accountValue) + spotTotal
  return { portfolio: equity, cash }
}
