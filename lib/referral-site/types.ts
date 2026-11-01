export type DecimalString = string

export type Referrer = {
  address: string
  username: string
  displayName: string
}

export type CodeLookup =
  | { code: string; status: "valid"; referrer: Referrer; memberNumber?: number }
  | { code: string; status: "unknown" }

export type SiteMe = {
  address: string
  username: string
  code: string
  registeredAt: string
  memberNumber: number
  referredBy: Referrer | null
}

export type ReferredTrader = {
  address: string
  username: string
  joinedAt: string
  firstTradeAt: string | null
  lastTradeAt: string | null
  volumeUsd: DecimalString
  feesPaidUsd: DecimalString
  earnedUsd: DecimalString
}

export type RecentTrade = {
  tid: string
  time: string
  address: string
  username: string
  coin: string
  side: "buy" | "sell"
  sizeUsd: DecimalString
  feeUsd: DecimalString
  earnedUsd: DecimalString
}

export type ReferralMarketState = "locked" | "unlocked" | "boosted"

export type ReferralMarket = {
  coin: string
  symbol: string
  ownVolumeUsd: DecimalString
  unlockVolumeUsd: DecimalString
  state: ReferralMarketState
  rate: DecimalString
  boostUntil: string | null
  unlockedAt: string | null
}

export type ReferralsResponse = {
  updatedAt: string
  rates: { entropyShare: DecimalString; referrerShare: DecimalString }
  totals: {
    earnedUsd: DecimalString
    volumeUsd: DecimalString
    referredCount: number
    tradingCount: number
  }
  referrals: ReferredTrader[]
  recentTrades: RecentTrade[]
  markets: ReferralMarket[]
}

export type SimulatedTradeResponse = {
  ok: true
  referee: string
  username: string
  tid: number
  coin: string
  notionalUsd: DecimalString
  feeUsd: DecimalString
  earnedUsd: DecimalString
}

export type AddedReferralResponse = {
  ok: true
  referee: string
  username: string
  code: string
}

export type SignupRequest = {
  code: string | null
  username: string
}

export type UsernameUnavailableReason = "invalid" | "reserved" | "taken"

export type UsernameAvailability =
  { available: true } | { available: false; reason: UsernameUnavailableReason }

export type NotAttributedReason = "unknown_code" | "existing_trader" | "self_referral"

export type Attribution =
  | { status: "attributed"; code: string; referrer: Referrer }
  | { status: "not_attributed"; code: string; reason: NotAttributedReason; referrer: Referrer | null }
  | { status: "no_code" }

export type SignupResponse =
  | { status: "registered"; me: SiteMe; attribution: Attribution }
  | { status: "already_registered"; me: SiteMe; ignoredCode: string | null }

export type EligibilityStatus = "eligible" | "has_traded" | "has_referrer" | "registered"

export type Eligibility = { status: EligibilityStatus }

export type EarningsSeriesRange = "1W" | "1M" | "ALL"

export type EarningsSeriesBucket = "hour" | "day"

export type EarningsSeriesPoint = { time: string; earnedUsd: DecimalString }

export type EarningsSeriesResponse = {
  range: EarningsSeriesRange
  bucket: EarningsSeriesBucket
  totalEarnedUsd: DecimalString
  rangeEarnedUsd: DecimalString
  points: EarningsSeriesPoint[]
}
