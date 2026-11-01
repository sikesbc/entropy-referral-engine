export type ReferralEnvelope<T> = {
  success: boolean
  data: T
}

export type ReferralRates = {
  referrerRate: number
  traderCashbackRate: number
}

export type ReferralProgram = {
  mode: string
  reviewWindowDays: number
  rates: ReferralRates
  nextRebateEstimate: number | null
  lastDistributionAt: string | null
}

export type ReferralVolume = {
  day: number
  week: number
  month: number
  allTime: number
}

export type ReferralCashback = {
  paid: number
  claimed: number
  approved: number
  pendingEvents: number
  pendingReview: number
}

export type ReferralFreshness = {
  status: string
  asOf: string
  lagSeconds: number
  checkedAt: string
}

export type ReferralPartner = {
  id: string
  slug: string
  tier: string
  displayName: string
  ownerUserId: string
  manualLinkChangeUsed: boolean
}

export type ReferralEarningsBucket = {
  bucket: string
  earnings: number
  cashback?: number
}

export type ReferralPayoutStatus = "pending" | "confirmed" | "canceled" | "failed"

export type ReferralPayout = {
  id: string
  status: ReferralPayoutStatus
  amount: number
  createdAt: string
  confirmedAt: string | null
  payoutTxHash: string | null
  chainId: number | null
}

export type ReferredUser = {
  id: string
  username: string | null
  avatarUrl: string | null
  joinedAt: string | null
  volumeUsd: number | null
  lifetimeCommission: number
}

export type ReferralEarnings = {
  paid: number
  tier: string
  rates: ReferralRates
  claimed: number
  history: ReferralEarningsBucket[]
  partner: ReferralPartner
  approved: number
  canClaim: boolean
  cashback: ReferralCashback
  activeTraders: number
  payoutHistory: ReferralPayout[]
  pendingEvents: number
  pendingReview: number
  referredUsers: ReferredUser[]
  currentWeekEnd: string
  referralVolume: ReferralVolume
  downlineSignups: number
  currentWeekStart: string
  lifetimeCashback: number
  lifetimeEarnings: number
  minimumPayoutUsd: number
  reviewWindowDays: number
  attributedWallets: number
  currentWeekCashback: number
  currentWeekEarnings: number
  downlineActiveTraders: number
  downlineReferralVolume: ReferralVolume
  currentWeekReferralVolume: number
  computedAt: string
  nextRefreshAt: string
  freshness: ReferralFreshness
}

export type ReferralPayouts = {
  enabled: boolean
  claims: UncapturedReferralRecord[]
}

export type ReferralAttributionPartner = {
  slug: string
  displayName: string | null
}

export type ReferralAttributionRecord = {
  sourceSlug: string
  partner: ReferralAttributionPartner
  attachedAt: string
}

export type ReferralAttribution = ReferralAttributionRecord | null

export type ApplyReferralCodeRequest = {
  code: string
}

export type ApplyReferralCodeResult =
  | { status: "attached"; attribution: ReferralAttributionRecord }
  | { status: "pending" }
  | { status: "rejected"; reason: ApplyReferralCodeRejection; message: string }

export type ApplyReferralCodeRejection =
  "invalid_code" | "unknown_code" | "self_referral" | "already_attributed"

export type UncapturedReferralRecord = Record<string, unknown>

export type ReferredUsersParams = {
  page: number
  pageSize: number
  sortBy: ReferredUsersSort
  sortOrder: "asc" | "desc"
  scope?: string
  depth?: number
}

export type ReferredUsersSort = "joined" | "volume" | "lifetime"

export type ReferredUsersPage = {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: string
  items: ReferredUser[]
  totalItems: number
  totalPages: number
  scope?: string
  depth?: string
}

export type ReferralTier = {
  slug: string
  displayName: string
  sortOrder: number
  ownTradeRebateRate: number
  directReferrerRate: number
  referredUserBenefitRate: number
}

export type ReferralTierInfo = {
  tier: ReferralTier
  maxSortOrder: number
}

export type ReferralRewardsConfigResponse = {
  data: { enabled: boolean }
}

export type ReferralProgramResponse = ReferralEnvelope<ReferralProgram>
export type ReferralEarningsResponse = ReferralEnvelope<ReferralEarnings>
export type ReferralPayoutsResponse = ReferralEnvelope<ReferralPayouts>
export type ReferralAttributionResponse = ReferralEnvelope<ReferralAttribution>
export type ReferredUsersResponse = ReferralEnvelope<ReferredUsersPage>
export type ApplyReferralCodeResponse = ReferralEnvelope<ApplyReferralCodeResult>
export type ReferralTierResponse = ReferralEnvelope<ReferralTierInfo>
