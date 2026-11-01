const DAY_MS = 86_400_000

export type EarningsRange = "week" | "month" | "all"

export type EarningsRangeOption = {
  value: EarningsRange
  label: string
  lookbackMs: number | null
  caption: string
}

export const EARNINGS_RANGES: readonly EarningsRangeOption[] = [
  { value: "week", label: "1W", lookbackMs: 7 * DAY_MS, caption: "Past week" },
  { value: "month", label: "1M", lookbackMs: 30 * DAY_MS, caption: "Past month" },
  { value: "all", label: "ALL", lookbackMs: null, caption: "All time" },
]

export const DEFAULT_EARNINGS_RANGE: EarningsRange = "month"

export type EarningsPoint = { time: number; value: number }
