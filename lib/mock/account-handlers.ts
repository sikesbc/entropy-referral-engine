import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import type { AccountMeResponse, UsernameAvailabilityResponse } from "@/lib/api/types/account"
import { sessionAccountFrom, sessionFromCookies, sessionSideFrom } from "@/lib/auth/server"
import { THEME_COOKIE } from "@/lib/theme/types"
import { setSessionCookie } from "./auth-handlers"
import { findHttpFixture } from "./fixtures"
import {
  completeAccountOnboarding,
  encodeAccountCookie,
  usernameProblem,
  type MockAccount,
} from "./mock-accounts"
import { mockSessionFor } from "./session"

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

function withAccount(response: AccountMeResponse, account: MockAccount | null): AccountMeResponse {
  if (!account) return response
  return {
    account: {
      ...response.account,
      id: account.id,
      privyUserId: account.privyUserId,
      username: account.username,
      email: account.email,
      avatarUrl: null,
      onboardingCompleted: account.onboarded,
      hasReferrer: account.referralCode !== null,
      twitterUsername: null,
      twitterLinkedAt: null,
    },
  }
}

async function serveAccountFixture(request: NextRequest, method: string, pathname: string) {
  if (sessionSideFrom(request.cookies) === "loggedout") return unauthorized()
  const record = await findHttpFixture("loggedin", method, pathname, new URLSearchParams())
  if (!record) return NextResponse.json({ error: "No fixture recorded" }, { status: 404 })
  const response = withAccount(record.response as AccountMeResponse, sessionAccountFrom(request.cookies))
  return NextResponse.json(response, { status: record.status })
}

export function serveAccountMe(request: NextRequest) {
  return serveAccountFixture(request, "GET", "/api/account/me")
}

export function serveAccountSync(request: NextRequest) {
  return serveAccountFixture(request, "POST", "/api/account/sync")
}

export async function serveUsernameAvailability(request: NextRequest) {
  if (sessionSideFrom(request.cookies) === "loggedout") return unauthorized()
  const username = (request.nextUrl.searchParams.get("username") ?? "").trim()
  const problem = usernameProblem(username, sessionAccountFrom(request.cookies))
  const response: UsernameAvailabilityResponse = problem
    ? { username, available: false, reason: problem }
    : { username, available: true }
  return NextResponse.json(response)
}

function readText(body: unknown, key: string): string | null {
  if (typeof body !== "object" || body === null) return null
  const value = (body as Record<string, unknown>)[key]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export async function completeOnboarding(request: NextRequest) {
  if (sessionSideFrom(request.cookies) === "loggedout") return unauthorized()
  const account = sessionAccountFrom(request.cookies)
  if (!account) return NextResponse.json(await sessionFromCookies(request.cookies))
  const body: unknown = await request.json().catch(() => null)
  const username = readText(body, "username") ?? account.username
  const problem = usernameProblem(username, account)
  if (problem === "invalid") {
    return NextResponse.json(
      { error: "Usernames must be 3-30 letters, numbers, or underscores." },
      { status: 400 },
    )
  }
  if (problem === "taken") {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 })
  }
  const next = completeAccountOnboarding(
    account,
    username,
    readText(body, "referralCode")?.toLowerCase() ?? null,
  )
  const session = await mockSessionFor("loggedin", request.cookies.get(THEME_COOKIE)?.value, next)
  const response = NextResponse.json(session)
  setSessionCookie(response, encodeAccountCookie(next))
  return response
}
