import { describe, expect, it } from "vitest"
import { usernameError } from "@/components/onboarding/username-rules"
import { ONBOARDING_COPY } from "@/components/onboarding/onboarding-copy"
import { usernameProblem } from "./username"

describe("usernameProblem", () => {
  it("rejects a trailing underscore but allows inner ones", () => {
    expect(usernameProblem("swift_")).toBe("trailing_underscore")
    expect(usernameProblem("swift_otter")).toBeNull()
  })

  it("reserves the demo user and entropy names in any case", () => {
    expect(usernameProblem("Bright_Falcon")).toBe("reserved")
    expect(usernameProblem("EntropyFan")).toBe("reserved")
    expect(usernameProblem("admin")).toBe("reserved")
  })

  it("enforces 3 to 30 characters", () => {
    expect(usernameProblem("ab")).toBe("length")
    expect(usernameProblem("a".repeat(31))).toBe("length")
    expect(usernameProblem("a".repeat(30))).toBeNull()
  })
})

describe("usernameError", () => {
  it("gives reserved names their own message and keeps copy free of hyphens", () => {
    expect(usernameError("bright_falcon", false)).toBe("That username is reserved.")
    expect(usernameError("", true)).toBe(ONBOARDING_COPY.usernameLength)
    expect(ONBOARDING_COPY.usernameLength).not.toMatch(/[-–—]/)
    expect(ONBOARDING_COPY.usernameHelp).not.toMatch(/[-–—]/)
  })
})
