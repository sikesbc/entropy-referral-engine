import type { SessionSide } from "@/lib/auth/types"

export type RuntimeConfig = {
  deterministic: boolean
  frozenNow: number | null
}

export function isSessionSide(value: unknown): value is SessionSide {
  return value === "loggedin" || value === "loggedout"
}
