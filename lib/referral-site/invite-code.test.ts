import { describe, expect, it } from "vitest"
import { checkInviteCode, inviteCodeCheckOf } from "./invite-code"
import { inviteNoticeFor, inviteNoticeHref, inviteNoticeOf } from "./invite-notice"
import type { CodeLookup } from "./types"

const otter: CodeLookup = {
  code: "swift_otter",
  status: "valid",
  referrer: { address: "0xAbC", username: "Swift_Otter", displayName: "Swift_Otter" },
}

describe("checkInviteCode", () => {
  it("classifies valid, unknown and own codes", () => {
    expect(inviteCodeCheckOf(otter)).toEqual({ status: "valid", username: "Swift_Otter" })
    expect(inviteCodeCheckOf({ code: "nobody", status: "unknown" })).toEqual({ status: "unknown" })
    expect(inviteCodeCheckOf(otter, { address: "0xabc" })).toEqual({ status: "own" })
    expect(inviteCodeCheckOf(otter, { code: "Swift_Otter" })).toEqual({ status: "own" })
  })

  it("normalizes input, treats blank as unknown and maps failures to error", async () => {
    const seen: string[] = []
    const lookup = async (code: string) => {
      seen.push(code)
      return otter
    }
    expect(await checkInviteCode("  SWIFT_OTTER ", {}, lookup)).toEqual({
      status: "valid",
      username: "Swift_Otter",
    })
    expect(seen).toEqual(["swift_otter"])
    expect(await checkInviteCode("   ", {}, lookup)).toEqual({ status: "unknown" })
    expect(await checkInviteCode("x", {}, () => Promise.reject(new Error("down")))).toEqual({
      status: "error",
    })
  })
})

describe("inviteNoticeFor", () => {
  it("says own for the viewer's link, ignored for someone else's, and round trips the redirect", () => {
    expect(inviteNoticeFor(otter, { address: "0xabc", code: "other" })).toEqual({ status: "own" })
    expect(inviteNoticeFor(otter, { address: "0xdef", code: "swift_otter" })).toEqual({ status: "own" })
    expect(inviteNoticeFor(otter, { address: "0xdef", code: "me" })).toEqual({
      status: "ignored",
      username: "Swift_Otter",
    })
    expect(inviteNoticeFor({ code: "x", status: "unknown" }, { address: "0xdef", code: "me" })).toBeNull()
    expect(inviteNoticeHref({ status: "own" })).toBe("/referrals?invite=own")
    expect(inviteNoticeHref({ status: "ignored", username: "a" })).toBe("/referrals?invite=ignored")
    expect(inviteNoticeHref(null)).toBe("/referrals")
    expect(inviteNoticeOf("own", "a")).toEqual({ status: "own" })
    expect(inviteNoticeOf("ignored", "a")).toEqual({ status: "ignored", username: "a" })
  })
})
