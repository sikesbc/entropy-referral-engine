import { usernameProblem, type UsernameProblem } from "@/lib/referral-site/username"
import { ONBOARDING_COPY } from "./onboarding-copy"

const PROBLEM_COPY: Record<UsernameProblem, string> = {
  characters: ONBOARDING_COPY.usernameChars,
  trailing_underscore: ONBOARDING_COPY.usernameUnderscore,
  length: ONBOARDING_COPY.usernameLength,
  reserved: ONBOARDING_COPY.usernameReserved,
}

export function usernameError(value: string, submitting: boolean): string | null {
  if (!value) return submitting ? ONBOARDING_COPY.usernameLength : null
  const problem = usernameProblem(value)
  return problem ? PROBLEM_COPY[problem] : null
}

export function suggestedUsername(username: string | null | undefined): string {
  if (!username || username.startsWith("0x")) return ""
  return username.replace(/_+$/, "")
}
