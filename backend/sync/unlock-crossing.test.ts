import { describe, expect, it } from "vitest"
import { findUnlockCrossings, type VolumeFill } from "./unlock-crossing"

function fill(coin: string, time: number, tid: number, px: string, sz: string): VolumeFill {
  return { coin, time, tid, px, sz }
}

describe("findUnlockCrossings", () => {
  it("returns nothing below the threshold", () => {
    expect(findUnlockCrossings([fill("io:NVDA", 1, 1, "100", "99.99")]).size).toBe(0)
  })

  it("unlocks at the fill that reaches the threshold exactly", () => {
    const crossings = findUnlockCrossings([
      fill("io:NVDA", 1, 1, "100", "50"),
      fill("io:NVDA", 2, 2, "100", "50"),
    ])
    expect(crossings.get("io:NVDA")).toBe(2)
  })

  it("accumulates across fills and keeps the first crossing time", () => {
    const crossings = findUnlockCrossings([
      fill("io:NVDA", 1, 1, "100", "60"),
      fill("io:NVDA", 2, 2, "100", "60"),
      fill("io:NVDA", 3, 3, "100", "600"),
    ])
    expect(crossings.get("io:NVDA")).toBe(2)
  })

  it("tracks each coin independently", () => {
    const crossings = findUnlockCrossings([
      fill("io:NVDA", 1, 1, "100", "150"),
      fill("io:ANTH", 2, 2, "10", "10"),
    ])
    expect([...crossings.keys()]).toEqual(["io:NVDA"])
  })

  it("orders unsorted input by time then tid", () => {
    const crossings = findUnlockCrossings([
      fill("io:NVDA", 5, 2, "100", "60"),
      fill("io:NVDA", 1, 1, "100", "60"),
    ])
    expect(crossings.get("io:NVDA")).toBe(5)
  })
})
