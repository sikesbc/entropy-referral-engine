import "server-only"
import type { SessionSide } from "@/lib/auth/types"

export function isDeterministic(): boolean {
  return process.env.MOCK_DETERMINISTIC === "1"
}

export function defaultSessionSide(): SessionSide {
  return process.env.MOCK_SESSION === "loggedin" ? "loggedin" : "loggedout"
}
