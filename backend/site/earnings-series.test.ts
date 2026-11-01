import { describe, expect, it } from "vitest"
import { buildEarningsSeries } from "./earnings-series"

const HOUR = 3_600_000
const DAY = 24 * HOUR
const NOW = Date.UTC(2026, 9, 29, 12, 30)

describe("buildEarningsSeries", () => {
  it("folds earnings before the window into the starting value and accumulates hourly buckets", () => {
    const weekStart = Math.floor((NOW - 7 * DAY) / HOUR) * HOUR
    const series = buildEarningsSeries(
      [
        { start: weekStart - 5 * HOUR, earned: "1.1" },
        { start: weekStart + HOUR, earned: "0.000001" },
        { start: Math.floor(NOW / HOUR) * HOUR, earned: "2.25" },
      ],
      "1W",
      NOW,
    )
    expect(series.bucket).toBe("hour")
    expect(series.totalEarnedUsd).toBe("3.350001")
    expect(series.rangeEarnedUsd).toBe("2.250001")
    expect(series.points[0]).toEqual({ time: new Date(weekStart).toISOString(), earnedUsd: "1.1" })
    expect(series.points[2]).toEqual({
      time: new Date(weekStart + 2 * HOUR).toISOString(),
      earnedUsd: "1.100001",
    })
    expect(series.points.at(-1)).toEqual({ time: new Date(NOW).toISOString(), earnedUsd: "3.350001" })
    expect(series.points).toHaveLength(7 * 24 + 2)
  })

  it("starts the all-time series at the first earning day", () => {
    const first = Math.floor(NOW / DAY) * DAY - 2 * DAY
    const series = buildEarningsSeries([{ start: first, earned: "0.5" }], "ALL", NOW)
    expect(series.bucket).toBe("day")
    expect(series.points.map((point) => point.earnedUsd)).toEqual(["0", "0.5", "0.5", "0.5"])
    expect(series.points[0].time).toBe(new Date(first).toISOString())
  })

  it("returns a flat zero line without earnings", () => {
    const series = buildEarningsSeries([], "1M", NOW)
    expect(series.totalEarnedUsd).toBe("0")
    expect(series.points.every((point) => point.earnedUsd === "0")).toBe(true)
    expect(series.points.length).toBeGreaterThan(30)
  })
})
