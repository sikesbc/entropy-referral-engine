import { describe, expect, it } from "vitest"
import { boostEventKey, pendingBoosts } from "./boosts"

const until = new Date("2026-11-01T12:00:00.000Z")

describe("pendingBoosts", () => {
  it("drops boosts already notified for the same coin and end time", () => {
    const boosts = [
      { coin: "io:NVDA", rate: "0.75", until },
      { coin: "io:OAI", rate: "0.75", until },
    ]
    const pending = pendingBoosts(boosts, new Set([boostEventKey("io:NVDA", until)]))
    expect(pending.map((boost) => boost.coin)).toEqual(["io:OAI"])
  })

  it("treats an extended boost as new", () => {
    const later = new Date("2026-11-02T12:00:00.000Z")
    const pending = pendingBoosts(
      [{ coin: "io:NVDA", rate: "0.75", until: later }],
      new Set([boostEventKey("io:NVDA", until)]),
    )
    expect(pending).toHaveLength(1)
  })
})
