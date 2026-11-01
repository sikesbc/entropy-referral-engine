import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { sessionFromCookies } from "@/lib/auth/server"
import { SESSION_COOKIE, type SessionSide } from "@/lib/auth/types"
import { THEME_COOKIE } from "@/lib/theme/types"
import { accountForEmail, encodeAccountCookie, type MockAccount } from "./mock-accounts"
import { mockSessionFor } from "./session"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_PATTERN = /^\d{6}$/
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  const body: unknown = await request.json().catch(() => null)
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}
}

export function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(SESSION_COOKIE, value, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
  })
}

async function withSession(side: SessionSide, request: NextRequest, account: MockAccount | null = null) {
  const themeOverride = account ? undefined : request.cookies.get(THEME_COOKIE)?.value
  const response = NextResponse.json(await mockSessionFor(side, themeOverride, account))
  setSessionCookie(response, account ? encodeAccountCookie(account) : side)
  if (side === "loggedout" || account) response.cookies.delete(THEME_COOKIE)
  return response
}

export async function getMockSession(request: NextRequest) {
  return NextResponse.json(await sessionFromCookies(request.cookies))
}

export async function startEmailSignIn(request: NextRequest) {
  const { email } = await readBody(request)
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
  }
  return NextResponse.json({ email: email.trim() })
}

export async function verifyEmailCode(request: NextRequest) {
  const { email, code } = await readBody(request)
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
  }
  if (typeof code !== "string" || !CODE_PATTERN.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 })
  }
  return withSession("loggedin", request, accountForEmail(email))
}

export async function signInWithWallet(request: NextRequest) {
  const { wallet } = await readBody(request)
  if (typeof wallet !== "string" || wallet.length === 0) {
    return NextResponse.json({ error: "Choose a wallet" }, { status: 400 })
  }
  return withSession("loggedin", request)
}

export async function signOut(request: NextRequest) {
  return withSession("loggedout", request)
}
