import { describe, expect, it } from "vitest"
import type { SiteMe } from "@/lib/referral-site/types"
import { eligibilityOf, validateUsername } from "./signup"

const me: SiteMe = {
  address: "0xabc",
  username: "swift_otter",
  code: "swift_otter",
  registeredAt: "2026-01-01T00:00:00Z",
  memberNumber: 1,
  referredBy: null,
}

describe("signup rules", () => {
  it("reports eligibility with the rule signup enforces", () => {
    expect(eligibilityOf(null, false)).toBe("eligible")
    expect(eligibilityOf(null, true)).toBe("has_traded")
    expect(eligibilityOf(me, true)).toBe("registered")
    expect(
      eligibilityOf({ ...me, referredBy: { address: "0xdef", username: "a", displayName: "a" } }, false),
    ).toBe("has_referrer")
  })

  it("validates usernames like the client does", () => {
    expect(validateUsername(" swift_otter ")).toBe("swift_otter")
    expect(() => validateUsername("swift_")).toThrow(expect.objectContaining({ code: "invalid_username" }))
    expect(() => validateUsername("bright_falcon")).toThrow(
      expect.objectContaining({ code: "reserved_username", message: "That username is reserved." }),
    )
    expect(() => validateUsername("ab")).toThrow(
      "Usernames are 3 to 30 characters: letters, numbers, and underscores.",
    )
  })
})
