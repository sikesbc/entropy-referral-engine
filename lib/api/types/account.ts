import type { WalletIdentity } from "./discovery"

export type Account = {
  id: string
  username: string
  email: string | null
  firstName: string | null
  lastName: string | null
  walletAddress: string
  privyUserId: string
  privyWalletAddress: string
  kycStatus: string
  experienceLevel: string | null
  isActive: boolean
  onboardingCompleted: boolean
  profileVisibility: string
  leaderboardVisible: boolean
  avatarUrl: string | null
  bio: string | null
  tradingThesis: string | null
  bannerUrl: string | null
  hasReferrer: boolean
  twitterUsername: string | null
  twitterProfileVisible: boolean
  twitterLinkedAt: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  hasTraded?: boolean
}

export type AccountMeResponse = {
  account: Account
}

export type AccountSyncResponse = AccountMeResponse

export type TradingAttestationResponse = {
  version: string
  accepted: boolean
  acceptedAt: string | null
}

export type GeoStatusResponse = {
  restricted: boolean
  country: string
  mode: string
  reason: string | null
}

export type FollowingResponse = {
  items: WalletIdentity[]
  version: string
}

export type UsernameAvailabilityResponse =
  { username: string; available: true } | { username: string; available: false; reason: "invalid" | "taken" }

export type CompleteOnboardingRequest = {
  username: string
  referralCode: string | null
}
