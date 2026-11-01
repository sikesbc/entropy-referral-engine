export type PricePoint = { time: number; price: number }

export type ChartPoint = { x: number; y: number }

export const SPARKLINE_EDGE_INSET = 6
export const SPARKLINE_VERTICAL_INSET = 7
export const SPARKLINE_LABEL_GAP = 8
export const SPARKLINE_LABEL_OVERLAP_SLOP = 4

function controlPoints(points: ChartPoint[], index: number): [number, number, number, number] {
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

export function smoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return ""
  let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const [c1x, c1y, c2x, c2y] = controlPoints(points, index)
    const next = points[index + 1]
    path += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`
  }
  return path
}

export function projectPoints(
  series: PricePoint[],
  width: number,
  height: number,
  { flushLeft, flushRight }: { flushLeft: boolean; flushRight: boolean },
): ChartPoint[] {
  const prices = series.map((point) => point.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const start = series[0].time
  const span = Math.max(1, series[series.length - 1].time - start)
  const left = flushLeft ? 0 : SPARKLINE_EDGE_INSET
  const right = flushRight ? 0 : SPARKLINE_EDGE_INSET
  return series.map((point) => ({
    x: left + ((width - left - right) * (point.time - start)) / span,
    y:
      SPARKLINE_VERTICAL_INSET +
      (height - 2 * SPARKLINE_VERTICAL_INSET) * (1 - (point.price - low) / (high - low || 1)),
  }))
}

export function labelPosition(
  anchor: ChartPoint,
  label: { width: number; height: number },
  chart: { width: number; height: number },
  isAbove: boolean,
): { left: number; top: number } {
  const left = Math.min(Math.max(0, anchor.x - label.width / 2), Math.max(0, chart.width - label.width))
  const preferredTop = isAbove
    ? anchor.y - label.height - SPARKLINE_LABEL_GAP
    : anchor.y + SPARKLINE_LABEL_GAP
  const top = Math.min(Math.max(0, preferredTop), Math.max(0, chart.height - label.height))
  return { left, top }
}
