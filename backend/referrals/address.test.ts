import { describe, expect, it } from "vitest"
import { normalizeAddress } from "./address"

const lower = "0xabcdef0123456789abcdef0123456789abcdef01"

describe("normalizeAddress", () => {
  it("returns lowercase for a valid address", () => {
    expect(normalizeAddress(lower)).toBe(lower)
  })

  it("lowercases mixed case", () => {
    expect(normalizeAddress("0xABCdef0123456789ABCDEF0123456789abcdef01")).toBe(lower)
  })

  it("trims whitespace", () => {
    expect(normalizeAddress(`  ${lower}\n`)).toBe(lower)
  })

  it("rejects wrong length", () => {
    expect(normalizeAddress("0xabc")).toBeNull()
    expect(normalizeAddress(`${lower}0`)).toBeNull()
  })

  it("rejects non-hex characters", () => {
    expect(normalizeAddress("0xzbcdef0123456789abcdef0123456789abcdef01")).toBeNull()
  })
})
