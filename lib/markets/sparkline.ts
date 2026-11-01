import type { Candle } from "@/lib/api/types/hyperliquid"

export type PricePoint = { time: number; price: number }

export type Point = { x: number; y: number }

const VERTICAL_PADDING = 7

export function candlePoints(candles: Candle[], intervalMs: number): PricePoint[] {
  return candles.map((candle) => ({ time: candle.t + intervalMs, price: parseFloat(candle.c) }))
}

export function windowPoints(
  points: PricePoint[],
  from: number,
  to: number,
  endPrice: number | null,
): PricePoint[] {
  const inside = points.filter((point) => point.time >= from && point.time < to)
  return endPrice === null ? inside : [...inside, { time: to, price: endPrice }]
}

function controlPoints(points: Point[], index: number): [number, number, number, number] {
  const previous = index === 0 ? points[index] : points[index - 1]
  const current = points[index]
  const next = points[index + 1]
  const after = index + 2 < points.length ? points[index + 2] : next
  return [
    current.x + (next.x - previous.x) / 6,
    current.y + (next.y - previous.y) / 6,
    next.x - (after.x - current.x) / 6,
    next.y - (after.y - current.y) / 6,
  ]
}

export function smoothPath(points: Point[]): string {
  if (points.length === 0) return ""
  let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const [c1x, c1y, c2x, c2y] = controlPoints(points, index)
    const next = points[index + 1]
    path += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`
  }
  return path
}

export function sparklinePaths(
  series: PricePoint[],
  width: number,
  height: number,
): { line: string; area: string } | null {
  if (series.length < 2) return null
  const sorted = [...series].sort((a, b) => a.time - b.time)
  const prices = sorted.map((point) => point.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const start = sorted[0].time
  const span = Math.max(1, sorted[sorted.length - 1].time - start)
  const points = sorted.map((point) => ({
    x: (width * (point.time - start)) / span,
    y: VERTICAL_PADDING + (height - VERTICAL_PADDING * 2) * (1 - (point.price - min) / (max - min || 1)),
  }))
  const line = smoothPath(points)
  const first = points[0]
  const last = points[points.length - 1]
  return { line, area: `${line} L${last.x.toFixed(2)},${height} L${first.x.toFixed(2)},${height} Z` }
}
