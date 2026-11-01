import type { EligibilityStatus } from "./types"

export const SIGNUP_DEMOS = ["success", "invalid", "existing", "registered", "rejected"] as const
export const REFERRALS_DEMOS = ["loaded", "empty", "signedout"] as const

export type SignupDemo = (typeof SIGNUP_DEMOS)[number]
export type ReferralsDemo = (typeof REFERRALS_DEMOS)[number]

type SearchValue = string | string[] | undefined

function pick<T extends string>(options: readonly T[], value: SearchValue, fallback: T): T | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined) return null
  return options.find((option) => option === raw) ?? fallback
}

export function signupDemo(value: SearchValue): SignupDemo | null {
  return pick(SIGNUP_DEMOS, value, "success")
}

export function referralsDemo(value: SearchValue): ReferralsDemo | null {
  return pick(REFERRALS_DEMOS, value, "loaded")
}

export function startsSignedIn(pathname: string, demo: string | null): boolean {
  return (
    (pathname.startsWith("/referrals") || pathname.startsWith("/entropy-referrals")) && demo !== "signedout"
  )
}

export function demoEligibility(demo: SignupDemo): EligibilityStatus {
  if (demo === "registered") return "registered"
  if (demo === "existing") return "has_traded"
  return "eligible"
}
