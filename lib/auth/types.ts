import type { Theme } from "@/lib/theme/types"

export type SessionSide = "loggedin" | "loggedout"

export type SessionUser = {
  id: string
  privyUserId: string
  username: string
  email: string | null
  walletAddress: string
  avatarUrl: string | null
  theme: Theme
  onboardingCompleted: boolean
}

export type Session = { status: "loggedin"; user: SessionUser } | { status: "loggedout"; user: null }

export const SIGNED_OUT: Session = { status: "loggedout", user: null }

export type WalletId =
  "metamask" | "okx" | "coinbase" | "rainbow" | "walletconnect" | "phantom" | (string & {})

export type EmailChallenge = { email: string }

export interface AuthProvider {
  getSession(): Promise<Session>
  signInWithEmail(email: string): Promise<EmailChallenge>
  verifyCode(email: string, code: string): Promise<Session>
  signInWithWallet(wallet: WalletId): Promise<Session>
  signOut(): Promise<Session>
}

export const SESSION_COOKIE = "entropy_session"
