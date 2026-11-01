import "server-only"
import { cookies } from "next/headers"
import { appModeEnabled } from "@/lib/app-mode"
import { decodeAccountCookie, type MockAccount } from "@/lib/mock/mock-accounts"
import { mockSessionFor } from "@/lib/mock/session"
import { defaultSessionSide } from "@/lib/runtime/env"
import { isSessionSide } from "@/lib/runtime/config"
import { THEME_COOKIE } from "@/lib/theme/types"
import { SESSION_COOKIE, type Session, type SessionSide } from "./types"

type CookieReader = { get(name: string): { value: string } | undefined }

export function sessionSideFrom(store: CookieReader): SessionSide {
  const value = store.get(SESSION_COOKIE)?.value
  if (decodeAccountCookie(value)) return "loggedin"
  if (isSessionSide(value)) return value
  return appModeEnabled() ? "loggedout" : defaultSessionSide()
}

export function sessionAccountFrom(store: CookieReader): MockAccount | null {
  return decodeAccountCookie(store.get(SESSION_COOKIE)?.value)
}

export function sessionFromCookies(store: CookieReader): Promise<Session> {
  return mockSessionFor(sessionSideFrom(store), store.get(THEME_COOKIE)?.value, sessionAccountFrom(store))
}

export async function getSessionSide(): Promise<SessionSide> {
  return sessionSideFrom(await cookies())
}

export async function getServerSession(): Promise<Session> {
  return sessionFromCookies(await cookies())
}
