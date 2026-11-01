export type ChartRange = "live" | "1D" | "1W" | "1M" | "1Y"
export type ChartType = "line" | "candle"
export type ChartInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d"

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const LIVE_WINDOW_MS = MINUTE

export const CHART_RANGES: { id: ChartRange; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "1D", label: "1D" },
  { id: "1W", label: "1W" },
  { id: "1M", label: "1M" },
  { id: "1Y", label: "1Y" },
]

export const CHART_INTERVALS: ChartInterval[] = ["1m", "5m", "15m", "1h", "4h", "1d"]

export const INTERVAL_MS: Record<ChartInterval, number> = {
  "1m": MINUTE,
  "5m": 5 * MINUTE,
  "15m": 15 * MINUTE,
  "1h": HOUR,
  "4h": 4 * HOUR,
  "1d": DAY,
}

export const RANGE_SPAN_MS: Record<Exclude<ChartRange, "live">, number> = {
  "1D": DAY,
  "1W": 7 * DAY,
  "1M": 30 * DAY,
  "1Y": 365 * DAY,
}

export const DEFAULT_RANGE_INTERVAL: Record<Exclude<ChartRange, "live">, ChartInterval> = {
  "1D": "15m",
  "1W": "1h",
  "1M": "4h",
  "1Y": "1d",
}

export const CHANGE_PERIOD_LABEL: Record<ChartRange, string> = {
  live: "Past minute",
  "1D": "Past day",
  "1W": "Past week",
  "1M": "Past month",
  "1Y": "Past year",
}

export function candleWindow(range: Exclude<ChartRange, "live">, interval: ChartInterval, now: number) {
  const step = INTERVAL_MS[interval]
  const endTime = Math.ceil(now / step) * step
  return { startTime: endTime - RANGE_SPAN_MS[range], endTime }
}

export const TIME_LABEL_FORMAT: Record<ChartRange, Intl.DateTimeFormatOptions> = {
  live: { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true },
  "1D": { hour: "2-digit", minute: "2-digit", hour12: true },
  "1W": { month: "short", day: "numeric" },
  "1M": { month: "short", day: "numeric" },
  "1Y": { month: "short", year: "numeric" },
}
