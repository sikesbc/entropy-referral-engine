"use client"

import {
  useReferralAttribution,
  useReferralEarnings,
  useReferralProgram,
  useReferralTier,
} from "@/lib/api/referrals"
import type {
  ReferralAttributionRecord,
  ReferralEarningsBucket,
  ReferralPayout,
  ReferralTier,
} from "@/lib/api/types/referrals"

export type ReferralOverview = {
  code: string | null
  lifetimeEarned: number | null
  history: ReferralEarningsBucket[] | null
  payouts: ReferralPayout[] | null
  rebateRate: number | null
  commissionRate: number | null
  referredUsers: number | null
  referredVolume: number | null
  tier: ReferralTier | null
  maxTierSortOrder: number | null
  attribution: ReferralAttributionRecord | null
  canApplyCode: boolean
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export function useReferralOverview(): ReferralOverview {
  const earningsQuery = useReferralEarnings()
  const tierQuery = useReferralTier()
  const programQuery = useReferralProgram()
  const attributionQuery = useReferralAttribution()

  const earnings = earningsQuery.data?.data ?? null
  const tierInfo = tierQuery.data?.data ?? null
  const attribution = attributionQuery.data?.data ?? null

  return {
    code: earnings?.partner.slug ?? null,
    lifetimeEarned: earnings ? earnings.lifetimeEarnings + (earnings.lifetimeCashback ?? 0) : null,
    history: earnings?.history ?? null,
    payouts: earnings?.payoutHistory ?? null,
    rebateRate: tierInfo?.tier.ownTradeRebateRate ?? null,
    commissionRate:
      tierInfo?.tier.directReferrerRate ??
      earnings?.rates.referrerRate ??
      programQuery.data?.data.rates.referrerRate ??
      null,
    referredUsers: earnings?.attributedWallets ?? null,
    referredVolume: earnings?.referralVolume.allTime ?? null,
    tier: tierInfo?.tier ?? null,
    maxTierSortOrder: tierInfo?.maxSortOrder ?? null,
    attribution,
    canApplyCode: attributionQuery.isSuccess && attribution === null,
    isLoading: !earnings && !earningsQuery.isError,
    isError: earningsQuery.isError,
    retry: () => {
      void earningsQuery.refetch()
    },
  }
}
