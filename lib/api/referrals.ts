"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/lib/auth/auth-context"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { apiGet, apiPost } from "./client"
import { POLL } from "./polling"
import type {
  ApplyReferralCodeRequest,
  ApplyReferralCodeResponse,
  ApplyReferralCodeResult,
  ReferralAttributionResponse,
  ReferralEarningsResponse,
  ReferralPayoutsResponse,
  ReferralProgramResponse,
  ReferralRewardsConfigResponse,
  ReferralTierResponse,
  ReferredUsersParams,
  ReferredUsersResponse,
} from "./types/referrals"

export const referralKeys = {
  all: ["referrals"] as const,
  program: () => [...referralKeys.all, "program"] as const,
  earnings: () => [...referralKeys.all, "earnings"] as const,
  payouts: () => [...referralKeys.all, "payouts"] as const,
  attribution: () => [...referralKeys.all, "attribution"] as const,
  referredUsers: (params: ReferredUsersParams) => [...referralKeys.all, "referred-users", params] as const,
  rewardsConfig: () => [...referralKeys.all, "rewards-config"] as const,
  tier: () => [...referralKeys.all, "tier"] as const,
}

export const fetchReferralProgram = () => apiGet<ReferralProgramResponse>("/api/referrals/program")
export const fetchReferralEarnings = () => apiGet<ReferralEarningsResponse>("/api/referrals/earnings")
export const fetchReferralPayouts = () => apiGet<ReferralPayoutsResponse>("/api/referrals/payouts")
export const fetchReferralAttribution = () =>
  apiGet<ReferralAttributionResponse>("/api/referrals/attribution")
export const applyReferralCode = (request: ApplyReferralCodeRequest) =>
  apiPost<ApplyReferralCodeResponse>("/api/referrals/attribution", request)
export const fetchReferredUsers = (params: ReferredUsersParams) =>
  apiGet<ReferredUsersResponse>("/api/referrals/referred-users", { ...params })
export const fetchReferralRewardsConfig = () =>
  apiGet<ReferralRewardsConfigResponse>("/api/referrals/rewards/config")
export const fetchReferralTier = () => apiGet<ReferralTierResponse>("/api/referrals/tier")

export function useReferralProgram() {
  return useQuery({ queryKey: referralKeys.program(), queryFn: fetchReferralProgram })
}

export function useReferralEarnings() {
  const { isSignedIn } = useSession()
  const refetchInterval = usePollingInterval(POLL.social)
  return useQuery({
    queryKey: referralKeys.earnings(),
    queryFn: fetchReferralEarnings,
    enabled: isSignedIn,
    refetchInterval,
  })
}

export function useReferralPayouts() {
  const { isSignedIn } = useSession()
  return useQuery({ queryKey: referralKeys.payouts(), queryFn: fetchReferralPayouts, enabled: isSignedIn })
}

export function useReferralAttribution() {
  const { isSignedIn } = useSession()
  return useQuery({
    queryKey: referralKeys.attribution(),
    queryFn: fetchReferralAttribution,
    enabled: isSignedIn,
  })
}

export function useReferredUsers(params: ReferredUsersParams, options: { enabled?: boolean } = {}) {
  const { isSignedIn } = useSession()
  return useQuery({
    queryKey: referralKeys.referredUsers(params),
    queryFn: () => fetchReferredUsers(params),
    enabled: isSignedIn && (options.enabled ?? true),
    staleTime: 30_000,
  })
}

export function useReferralRewardsConfig() {
  const { isSignedIn } = useSession()
  return useQuery({
    queryKey: referralKeys.rewardsConfig(),
    queryFn: fetchReferralRewardsConfig,
    enabled: isSignedIn,
  })
}

export function useReferralTier() {
  const { isSignedIn } = useSession()
  return useQuery({ queryKey: referralKeys.tier(), queryFn: fetchReferralTier, enabled: isSignedIn })
}

export function useApplyReferralCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string): Promise<ApplyReferralCodeResult> =>
      (await applyReferralCode({ code })).data,
    onSuccess: (result) => {
      if (result.status !== "attached") return
      queryClient.setQueryData<ReferralAttributionResponse>(referralKeys.attribution(), {
        success: true,
        data: result.attribution,
      })
    },
  })
}
