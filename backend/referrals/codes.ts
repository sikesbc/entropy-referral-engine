import "server-only"

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/
const CODE_PATTERN = /^[a-z0-9_]{3,30}$/
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
const RESERVED_PREFIX = "entropy"
const SIMULATED_PREFIX = "trader_"
const SIMULATED_SUFFIX_LENGTH = 6

export function normalizeUsername(input: string): string {
  return input.trim()
}

export function isValidUsername(input: string): boolean {
  return USERNAME_PATTERN.test(input)
}

export function isReservedUsername(input: string): boolean {
  const lowered = input.toLowerCase()
  return RESERVED_USERNAMES.has(lowered) || lowered.startsWith(RESERVED_PREFIX)
}

export function usernameToCode(username: string): string {
  return username.toLowerCase()
}

export function simulatedUsername(random: () => number): string {
  let suffix = ""
  for (let index = 0; index < SIMULATED_SUFFIX_LENGTH; index++) {
    suffix += Math.min(15, Math.floor(random() * 16)).toString(16)
  }
  return `${SIMULATED_PREFIX}${suffix}`
}

export function normalizeCode(input: string): string {
  return input.trim().toLowerCase()
}

export function isValidCode(input: string): boolean {
  return CODE_PATTERN.test(input)
}

export function canChangeCode(changesUsed: number): boolean {
  return changesUsed === 0
}
