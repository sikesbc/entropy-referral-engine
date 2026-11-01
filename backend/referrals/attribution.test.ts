import { describe, expect, it } from "vitest"
import { decideAttribution } from "./attribution"

const base = {
  refereeRoot: "0xreferee",
  code: "brave-otter-42" as string | null,
  referrer: { root: "0xreferrer" } as { root: string } | null,
  refereeAlreadyRegistered: false,
  refereeHasIoHistory: false,
}

describe("decideAttribution", () => {
  it("attributes a fresh referee with a known code", () => {
    expect(decideAttribution(base)).toEqual({
      kind: "attributed",
      referrerRoot: "0xreferrer",
    })
  })

  it("rejects a missing code", () => {
    expect(decideAttribution({ ...base, code: null, referrer: null })).toEqual({
      kind: "unattributed",
      reason: "no_code",
    })
  })

  it("rejects an unknown code", () => {
    expect(decideAttribution({ ...base, referrer: null })).toEqual({
      kind: "unattributed",
      reason: "unknown_code",
    })
  })

  it("rejects self referral by matching root", () => {
    expect(decideAttribution({ ...base, referrer: { root: "0xreferee" } })).toEqual({
      kind: "unattributed",
      reason: "self_referral",
    })
  })

  it("rejects an existing trader", () => {
    expect(decideAttribution({ ...base, refereeHasIoHistory: true })).toEqual({
      kind: "unattributed",
      reason: "existing_trader",
    })
  })

  it("rejects an already registered referee", () => {
    expect(decideAttribution({ ...base, refereeAlreadyRegistered: true })).toEqual({
      kind: "unattributed",
      reason: "already_registered",
    })
  })

  it("puts already_registered ahead of every other reason", () => {
    expect(
      decideAttribution({
        ...base,
        code: null,
        referrer: null,
        refereeAlreadyRegistered: true,
        refereeHasIoHistory: true,
      }),
    ).toEqual({ kind: "unattributed", reason: "already_registered" })
  })

  it("puts unknown_code ahead of existing_trader", () => {
    expect(decideAttribution({ ...base, referrer: null, refereeHasIoHistory: true })).toMatchObject({
      reason: "unknown_code",
    })
  })

  it("puts self_referral ahead of existing_trader", () => {
    expect(
      decideAttribution({
        ...base,
        referrer: { root: "0xreferee" },
        refereeHasIoHistory: true,
      }),
    ).toMatchObject({ reason: "self_referral" })
  })
})
