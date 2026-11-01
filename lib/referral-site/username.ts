export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30

const USERNAME_CHARACTERS = /^[A-Za-z0-9_]*$/
const RESERVED_PREFIX = "entropy"
const RESERVED_USERNAMES = new Set([
  "entropy",
  "admin",
  "support",
  "hyperliquid",
  "io",
  "api",
  "r",
  "referrals",
  "official",
  "team",
  "help",
  "mod",
  "moderator",
  "bright_falcon",
])

export type UsernameProblem = "characters" | "trailing_underscore" | "length" | "reserved"

export function isReservedUsername(username: string): boolean {
  const lowered = username.toLowerCase()
  return RESERVED_USERNAMES.has(lowered) || lowered.startsWith(RESERVED_PREFIX)
}

export function usernameProblem(username: string): UsernameProblem | null {
  if (!USERNAME_CHARACTERS.test(username)) return "characters"
  if (username.endsWith("_")) return "trailing_underscore"
  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) return "length"
  if (isReservedUsername(username)) return "reserved"
  return null
}
