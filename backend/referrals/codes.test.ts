import { describe, expect, it } from "vitest"
import {
  canChangeCode,
  isReservedUsername,
  isValidCode,
  isValidUsername,
  normalizeCode,
  normalizeUsername,
  simulatedUsername,
  usernameToCode,
} from "./codes"

describe("normalizeUsername", () => {
  it("trims but keeps case", () => {
    expect(normalizeUsername("  Ben_K ")).toBe("Ben_K")
  })
})

describe("isValidUsername", () => {
  it("accepts 3 to 30 letters, numbers, and underscores in any case", () => {
    expect(isValidUsername("Ben")).toBe(true)
    expect(isValidUsername("ben_99")).toBe(true)
    expect(isValidUsername("a".repeat(30))).toBe(true)
  })

  it("rejects bad lengths, stray characters, and empty input", () => {
    expect(isValidUsername("ab")).toBe(false)
    expect(isValidUsername("a".repeat(31))).toBe(false)
    expect(isValidUsername("ben-k")).toBe(false)
    expect(isValidUsername("ben k")).toBe(false)
    expect(isValidUsername("")).toBe(false)
  })
})

describe("isReservedUsername", () => {
  it("rejects reserved names in any case and anything starting with entropy", () => {
    expect(isReservedUsername("Admin")).toBe(true)
    expect(isReservedUsername("IO")).toBe(true)
    expect(isReservedUsername("entropy_fan")).toBe(true)
    expect(isReservedUsername("EntropyTrader")).toBe(true)
  })

  it("allows ordinary names", () => {
    expect(isReservedUsername("ben")).toBe(false)
    expect(isReservedUsername("ioana")).toBe(false)
  })
})

describe("usernameToCode and normalizeCode", () => {
  it("lowercase the username and the lookup input", () => {
    expect(usernameToCode("Ben_K")).toBe("ben_k")
    expect(normalizeCode("  Ben_K ")).toBe("ben_k")
  })
})

describe("simulatedUsername", () => {
  it("is a valid username with a trader_ prefix and six hex characters", () => {
    expect(simulatedUsername(() => 0.5)).toMatch(/^trader_[0-9a-f]{6}$/)
    expect(isValidUsername(simulatedUsername(Math.random))).toBe(true)
  })
})

describe("isValidCode", () => {
  it("accepts lowercase usernames and rejects uppercase or hyphens", () => {
    expect(isValidCode("ben_99")).toBe(true)
    expect(isValidCode("Ben")).toBe(false)
    expect(isValidCode("brave-otter-42")).toBe(false)
  })
})

describe("canChangeCode", () => {
  it("is true only when no changes have been used", () => {
    expect(canChangeCode(0)).toBe(true)
    expect(canChangeCode(1)).toBe(false)
  })
})
