import { describe, expect, it } from "vitest"
import { BOOST_RATE, UNLOCKED_RATE, buildMarket, marketState, rateForTrade } from "./market-programs"

const unlockedAt = "2026-10-10T00:00:00Z"
const boost = { until: "2026-11-15T00:00:00Z" }

describe("rateForTrade", () => {
  it("pays the base rate on a locked market", () => {
    expect(rateForTrade({ coin: "io:NVDA", time: "2026-10-20T00:00:00Z" })).toBe("0.5")
  })

  it("pays the unlocked rate only from the unlock time forward", () => {
    const input = { coin: "io:NVDA", unlockedAt }
    expect(rateForTrade({ ...input, time: "2026-10-09T23:59:59Z" })).toBe("0.5")
    expect(rateForTrade({ ...input, time: unlockedAt })).toBe(UNLOCKED_RATE)
  })

  it("pays the boost rate only before the boost ends", () => {
    const input = { coin: "io:ANTH", boost }
    expect(rateForTrade({ ...input, time: "2026-11-14T23:59:59Z" })).toBe(BOOST_RATE)
    expect(rateForTrade({ ...input, time: boost.until })).toBe("0.5")
  })

  it("takes the max of unlock and boost without stacking", () => {
    expect(rateForTrade({ coin: "io:ANTH", unlockedAt, boost, time: "2026-10-20T00:00:00Z" })).toBe(
      BOOST_RATE,
    )
    expect(rateForTrade({ coin: "io:ANTH", unlockedAt, boost, time: "2026-11-20T00:00:00Z" })).toBe(
      UNLOCKED_RATE,
    )
  })

  it("keeps friends who joined before the unlock at the base rate", () => {
    const input = { coin: "io:NVDA", unlockedAt, time: "2026-10-20T00:00:00Z" }
    expect(rateForTrade({ ...input, joinedAt: "2026-10-09T23:59:59Z" })).toBe("0.5")
    expect(rateForTrade({ ...input, joinedAt: unlockedAt })).toBe(UNLOCKED_RATE)
    expect(rateForTrade({ ...input, joinedAt: "2026-10-15T00:00:00Z" })).toBe(UNLOCKED_RATE)
  })

  it("pays the boost rate to every friend regardless of join time", () => {
    const input = { coin: "io:ANTH", unlockedAt, boost, time: "2026-10-20T00:00:00Z" }
    expect(rateForTrade({ ...input, joinedAt: "2026-10-01T00:00:00Z" })).toBe(BOOST_RATE)
    expect(rateForTrade({ ...input, joinedAt: "2026-10-15T00:00:00Z" })).toBe(BOOST_RATE)
  })

  it("never drops below a higher base rate", () => {
    expect(rateForTrade({ coin: "io:NVDA", unlockedAt, base: "0.7", time: "2026-10-20T00:00:00Z" })).toBe(
      "0.7",
    )
  })
})

describe("marketState", () => {
  const now = "2026-10-31T00:00:00Z"

  it("orders boosted over unlocked over locked", () => {
    expect(marketState({ now, unlockedAt, boost })).toBe("boosted")
    expect(marketState({ now, unlockedAt })).toBe("unlocked")
    expect(marketState({ now })).toBe("locked")
  })

  it("falls back to unlocked once the boost has ended", () => {
    expect(marketState({ now: "2026-11-16T00:00:00Z", unlockedAt, boost })).toBe("unlocked")
  })
})

describe("buildMarket", () => {
  it("reports the current rate and dates for the UI", () => {
    expect(
      buildMarket({ coin: "io:ANTH", now: "2026-10-31T00:00:00Z", ownVolumeUsd: "4200", boost }),
    ).toEqual({
      coin: "io:ANTH",
      symbol: "ANTH",
      ownVolumeUsd: "4200",
      unlockVolumeUsd: "10000",
      state: "boosted",
      rate: BOOST_RATE,
      boostUntil: "2026-11-15T00:00:00.000Z",
      unlockedAt: null,
    })
  })
})
