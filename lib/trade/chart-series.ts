import type { Candle } from "@/lib/api/types/hyperliquid"
import type { LiveTick } from "@/lib/api/types/markets"
import { LIVE_WINDOW_MS } from "./chart-ranges"

export type PricePoint = { t: number; p: number }

export type CandleBar = { t: number; o: number; h: number; l: number; c: number }

export type ChartSeries = {
  start: number
  end: number
  points: PricePoint[]
  candles: CandleBar[]
}

export type PriceDomain = { min: number; max: number }

const SECOND_MS = 1000
const DOMAIN_PADDING = 0.06
const FLAT_DOMAIN_RATIO = 0.0005

function resampleTicks(ticks: LiveTick[], from: number, to: number): PricePoint[] {
  const points: PricePoint[] = []
  let index = 0
  let price: number | null = null
  for (let second = Math.floor(from / SECOND_MS); second * SECOND_MS <= to; second++) {
    while (index < ticks.length && ticks[index][0] <= second) {
      price = ticks[index][1]
      index++
    }
    if (price !== null) points.push({ t: second * SECOND_MS, p: price })
  }
  return points
}

export function liveSeries(ticks: LiveTick[], now: number): ChartSeries {
  const end = now
  const start = end - LIVE_WINDOW_MS
  const points = resampleTicks(ticks, start - LIVE_WINDOW_MS, end)
  const last = points.at(-1)
  if (last && last.t < end) points.push({ t: end, p: last.p })
  return { start, end, points, candles: [] }
}

export function candleSeries(candles: Candle[], start: number, end: number): ChartSeries {
  const bars = candles.map((candle) => ({
    t: candle.t,
    o: Number(candle.o),
    h: Number(candle.h),
    l: Number(candle.l),
    c: Number(candle.c),
  }))
  return { start, end, points: bars.map((bar) => ({ t: bar.t, p: bar.c })), candles: bars }
}

function priceAtStart(series: ChartSeries): number | null {
  let anchor: PricePoint | null = null
  for (const point of series.points) {
    if (point.t <= series.start) anchor = point
    else break
  }
  return anchor?.p ?? series.candles[0]?.o ?? series.points[0]?.p ?? null
}

export function seriesChange(series: ChartSeries, latest: number | null): number | null {
  const reference = priceAtStart(series)
  if (reference === null || latest === null) return null
  return latest - reference
}

export function seriesDomain(series: ChartSeries, includeCandles: boolean): PriceDomain | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let previous: PricePoint | null = null
  for (const point of series.points) {
    if (point.t < series.start) {
      previous = point
      continue
    }
    min = Math.min(min, point.p)
    max = Math.max(max, point.p)
  }
  if (previous) {
    min = Math.min(min, previous.p)
    max = Math.max(max, previous.p)
  }
  if (includeCandles) {
    for (const bar of series.candles) {
      if (bar.t < series.start) continue
      min = Math.min(min, bar.l)
      max = Math.max(max, bar.h)
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null
  const span = max - min
  const padding = span > 0 ? span * DOMAIN_PADDING : Math.abs(max) * FLAT_DOMAIN_RATIO || 1
  return { min: min - padding, max: max + padding }
}
