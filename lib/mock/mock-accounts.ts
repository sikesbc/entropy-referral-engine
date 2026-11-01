import "server-only"
import { createHash } from "node:crypto"

export type MockAccount = {
  id: string
  privyUserId: string
  email: string
  username: string
  onboarded: boolean
  referralCode: string | null
}

const COOKIE_PREFIX = "loggedin."
const REGISTRY_KEY = Symbol.for("entropy.mock.accounts")
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/
const RESERVED_USERNAMES = [
  "entropy",
  "admin",
  "support",
  "QuietHarbor2031",
  "izebel_eth",
  "mello",
  "hansolar",
  "yyds",
]

const FIRST_WORDS = [
  "Ballet",
  "Enigma",
  "Velvet",
  "Lunar",
  "Amber",
  "Cobalt",
  "Silent",
  "Golden",
  "Neon",
  "Crimson",
  "Polar",
  "Quartz",
]
const SECOND_WORDS = [
  "Quest",
  "Tornado",
  "Falcon",
  "Harbor",
  "Comet",
  "Ember",
  "Atlas",
  "Raven",
  "Summit",
  "Voyage",
  "Signal",
  "Orbit",
]

type Registry = Map<string, MockAccount>

function registry(): Registry {
  const store = globalThis as typeof globalThis & { [REGISTRY_KEY]?: Registry }
  store[REGISTRY_KEY] ??= new Map()
  return store[REGISTRY_KEY]
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function uuidFrom(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function suggestUsername(hex: string): string {
  const first = FIRST_WORDS[parseInt(hex.slice(32, 36), 16) % FIRST_WORDS.length]
  const second = SECOND_WORDS[parseInt(hex.slice(36, 40), 16) % SECOND_WORDS.length]
  const year = 2000 + (parseInt(hex.slice(40, 44), 16) % 100)
  return `${first}${second}${year}`
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function accountForEmail(email: string): MockAccount {
  const key = normalizeEmail(email)
  const known = registry().get(key)
  if (known) return known
  const hex = digest(key)
  return {
    id: uuidFrom(hex),
    privyUserId: `did:privy:mock${hex.slice(44, 64)}`,
    email: email.trim(),
    username: suggestUsername(hex),
    onboarded: false,
    referralCode: null,
  }
}

export function completeAccountOnboarding(
  account: MockAccount,
  username: string,
  referralCode: string | null,
): MockAccount {
  const next: MockAccount = {
    ...account,
    username,
    onboarded: true,
    referralCode: referralCode ?? account.referralCode,
  }
  registry().set(normalizeEmail(account.email), next)
  return next
}

export function encodeAccountCookie(account: MockAccount): string {
  return `${COOKIE_PREFIX}${Buffer.from(JSON.stringify(account)).toString("base64url")}`
}

function isMockAccount(value: unknown): value is MockAccount {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === "string" &&
    typeof record.privyUserId === "string" &&
    typeof record.email === "string" &&
    typeof record.username === "string" &&
    typeof record.onboarded === "boolean" &&
    (record.referralCode === null || typeof record.referralCode === "string")
  )
}

export function decodeAccountCookie(value: string | undefined): MockAccount | null {
  if (!value?.startsWith(COOKIE_PREFIX)) return null
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value.slice(COOKIE_PREFIX.length), "base64url").toString())
    return isMockAccount(parsed) ? parsed : null
  } catch {
    return null
  }
}

export type UsernameProblem = "invalid" | "taken"

export function usernameProblem(username: string, owner: MockAccount | null): UsernameProblem | null {
  if (!USERNAME_PATTERN.test(username) || username.endsWith("_")) return "invalid"
  const wanted = username.toLowerCase()
  if (owner && owner.username.toLowerCase() === wanted) return null
  if (RESERVED_USERNAMES.some((name) => name.toLowerCase() === wanted)) return "taken"
  for (const account of registry().values()) {
    if (account.id !== owner?.id && account.username.toLowerCase() === wanted) return "taken"
  }
  return null
}
