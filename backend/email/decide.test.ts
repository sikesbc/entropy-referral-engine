import { describe, expect, it } from "vitest"
import { DEFAULT_PREFS, decideDelivery, INDIVIDUAL_LIMIT, isoWeek } from "./decide"

describe("decideDelivery", () => {
  it("skips everything without an active subscription", () => {
    expect(decideDelivery({ kind: "joined", prefs: null, sentIndividually: 0 })).toBe("skipped")
    expect(decideDelivery({ kind: "boost", prefs: null, sentIndividually: 0 })).toBe("skipped")
  })

  it("sends the first three joins and first trades individually", () => {
    for (const kind of ["joined", "first_trade"] as const) {
      for (let sent = 0; sent < INDIVIDUAL_LIMIT; sent++) {
        expect(decideDelivery({ kind, prefs: DEFAULT_PREFS, sentIndividually: sent })).toBe("immediate")
      }
    }
  })

  it("rolls the fourth join and first trade into the weekly summary", () => {
    expect(decideDelivery({ kind: "joined", prefs: DEFAULT_PREFS, sentIndividually: 3 })).toBe("batched")
    expect(decideDelivery({ kind: "first_trade", prefs: DEFAULT_PREFS, sentIndividually: 7 })).toBe("batched")
  })

  it("always sends unlocks and boosts immediately", () => {
    expect(decideDelivery({ kind: "unlock", prefs: DEFAULT_PREFS, sentIndividually: 50 })).toBe("immediate")
    expect(decideDelivery({ kind: "boost", prefs: DEFAULT_PREFS, sentIndividually: 50 })).toBe("immediate")
  })

  it("skips a kind whose switch is off", () => {
    const prefs = { ...DEFAULT_PREFS, firstTrade: false, boost: false }
    expect(decideDelivery({ kind: "first_trade", prefs, sentIndividually: 0 })).toBe("skipped")
    expect(decideDelivery({ kind: "boost", prefs, sentIndividually: 0 })).toBe("skipped")
    expect(decideDelivery({ kind: "joined", prefs, sentIndividually: 0 })).toBe("immediate")
  })

  it("batches every enabled kind when weekly summary only is on", () => {
    const prefs = { ...DEFAULT_PREFS, weeklyOnly: true, joined: false }
    expect(decideDelivery({ kind: "unlock", prefs, sentIndividually: 0 })).toBe("batched")
    expect(decideDelivery({ kind: "first_trade", prefs, sentIndividually: 0 })).toBe("batched")
    expect(decideDelivery({ kind: "joined", prefs, sentIndividually: 0 })).toBe("skipped")
  })
})

describe("isoWeek", () => {
  it("labels weeks by ISO year and number", () => {
    expect(isoWeek(new Date("2026-10-31T12:00:00Z"))).toBe("2026-W44")
    expect(isoWeek(new Date("2027-01-01T00:00:00Z"))).toBe("2026-W53")
  })
})
