import "server-only"
import type { AccountMeResponse } from "@/lib/api/types/account"
import type { Session, SessionSide } from "@/lib/auth/types"
import { SIGNED_OUT } from "@/lib/auth/types"
import { isTheme, type Theme } from "@/lib/theme/types"
import { capturedAccountPreferences } from "./captured-preferences"
import { findHttpFixture } from "./fixtures"
import type { MockAccount } from "./mock-accounts"

const NEW_ACCOUNT_THEME: Theme = "dark"

export async function mockSessionFor(
  side: SessionSide,
  themeOverride?: string,
  account: MockAccount | null = null,
): Promise<Session> {
  if (side === "loggedout") return SIGNED_OUT
  const fixture = await findHttpFixture("loggedin", "GET", "/api/account/me", new URLSearchParams())
  if (!fixture) return SIGNED_OUT
  const captured = (fixture.response as AccountMeResponse).account
  const defaultTheme = account ? NEW_ACCOUNT_THEME : capturedAccountPreferences.theme
  const theme: Theme = isTheme(themeOverride) ? themeOverride : defaultTheme
  return {
    status: "loggedin",
    user: {
      id: account?.id ?? captured.id,
      privyUserId: account?.privyUserId ?? captured.privyUserId,
      username: account?.username ?? captured.username,
      email: account?.email ?? captured.email,
      walletAddress: captured.walletAddress,
      avatarUrl: account ? null : captured.avatarUrl,
      theme,
      onboardingCompleted: account?.onboarded ?? captured.onboardingCompleted,
    },
  }
}
