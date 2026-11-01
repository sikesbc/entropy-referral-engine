export type ChartPoint = { x: number; y: number }

const E10 = Math.sqrt(50)
const E5 = Math.sqrt(10)
const E2 = Math.sqrt(2)

export function tickStep(min: number, max: number, count: number): number {
  const raw = (max - min) / Math.max(1, count)
  if (!(raw > 0) || !Number.isFinite(raw)) return 0
  const power = Math.floor(Math.log10(raw))
  const error = raw / 10 ** power
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1
  return factor * 10 ** power
}

export function niceTicks(min: number, max: number, count: number): number[] {
  const step = tickStep(min, max, count)
  if (step === 0) return []
  const first = Math.ceil(min / step)
  const last = Math.floor(max / step)
  const ticks: number[] = []
  for (let i = first; i <= last; i++) ticks.push(Number((i * step).toPrecision(12)))
  return ticks
}

function sign(value: number): number {
  return value < 0 ? -1 : 1
}

function interiorSlope(a: ChartPoint, b: ChartPoint, c: ChartPoint): number {
  const h0 = b.x - a.x
  const h1 = c.x - b.x
  const s0 = (b.y - a.y) / (h0 || (h1 < 0 ? -0 : 0))
  const s1 = (c.y - b.y) / (h1 || (h0 < 0 ? -0 : 0))
  const p = (s0 * h1 + s1 * h0) / (h0 + h1)
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0
}

function endSlope(a: ChartPoint, b: ChartPoint, tangent: number): number {
  const h = b.x - a.x
  return h ? ((3 * (b.y - a.y)) / h - tangent) / 2 : tangent
}

function fmt(value: number): string {
  return value.toFixed(2)
}

export function monotonePath(points: ChartPoint[]): string {
  const n = points.length
  if (n === 0) return ""
  const start = `M${fmt(points[0].x)},${fmt(points[0].y)}`
  if (n === 1) return start
  if (n === 2) return `${start} L${fmt(points[1].x)},${fmt(points[1].y)}`
  const tangents = new Array<number>(n)
  for (let i = 1; i < n - 1; i++) tangents[i] = interiorSlope(points[i - 1], points[i], points[i + 1])
  tangents[0] = endSlope(points[0], points[1], tangents[1])
  tangents[n - 1] = endSlope(points[n - 2], points[n - 1], tangents[n - 2])
  const segments = [start]
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const dx = (b.x - a.x) / 3
    segments.push(
      `C${fmt(a.x + dx)},${fmt(a.y + dx * tangents[i])} ${fmt(b.x - dx)},${fmt(b.y - dx * tangents[i + 1])} ${fmt(b.x)},${fmt(b.y)}`,
    )
  }
  return segments.join(" ")
}

export function areaPath(points: ChartPoint[], baseline: number): string {
  if (points.length === 0) return ""
  const first = points[0]
  const last = points[points.length - 1]
  return `${monotonePath(points)} L${fmt(last.x)},${fmt(baseline)} L${fmt(first.x)},${fmt(baseline)} Z`
}
