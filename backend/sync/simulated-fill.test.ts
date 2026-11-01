import Big from "big.js"
import { describe, expect, it } from "vitest"
import {
  MAX_NOTIONAL,
  MIN_NOTIONAL,
  SIMULATED_MARKETS,
  TAKER_FEE_RATE,
  buildSimulatedFill,
} from "./simulated-fill"

function sequence(values: number[]) {
  let index = 0
  return () => values[index++ % values.length]
}

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe("buildSimulatedFill", () => {
  it("builds an io: USDC fill at the given time", () => {
    const fill = buildSimulatedFill(seeded(1), 1_700_000_000_000)
    expect(Object.keys(SIMULATED_MARKETS)).toContain(fill.coin)
    expect(fill.feeToken).toBe("USDC")
    expect(fill.time).toBe(1_700_000_000_000)
    expect(fill.hash).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it("keeps notional inside the range and charges the taker rate on crossed fills", () => {
    const random = seeded(7)
    for (let index = 0; index < 200; index++) {
      const fill = buildSimulatedFill(random, 1_700_000_000_000)
      const notional = new Big(fill.px).times(fill.sz)
      expect(notional.gte(MIN_NOTIONAL - 5)).toBe(true)
      expect(notional.lte(MAX_NOTIONAL)).toBe(true)
      if (fill.crossed) {
        expect(new Big(fill.fee).minus(notional.times(TAKER_FEE_RATE)).abs().lte("0.0000005")).toBe(true)
      } else {
        expect(new Big(fill.fee).lt(0)).toBe(true)
      }
    }
  })

  it("produces a negative fee on maker fills", () => {
    const fill = buildSimulatedFill(sequence([0, 0.5, 0.5, 0.01, 0.5]), 1_700_000_000_000)
    expect(fill.crossed).toBe(false)
    expect(new Big(fill.fee).lt(0)).toBe(true)
  })

  it("gives distinct tids for fills at different times", () => {
    const random = seeded(3)
    const tids = new Set(
      Array.from({ length: 50 }, (_, index) => buildSimulatedFill(random, 1_700_000_000_000 + index).tid),
    )
    expect(tids.size).toBe(50)
  })
})
