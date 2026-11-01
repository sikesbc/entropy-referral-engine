export type Candle = { y: number; height: number; width: number }

export type Ripple = { x: number; y: number; time: number; intensity: number }

export type Point = { x: number; y: number }

export const CANDLE_COLUMN_SPACING = 15
export const RIPPLE_DURATION_MS = 2500
const POINTER_RADIUS = 180
const RIPPLE_SPEED = 300
const RIPPLE_BAND = 60

function noise(x: number, y: number, seed: number): number {
  return (
    (Math.sin(x * 0.02 + seed) * Math.cos(y * 0.02 + seed) +
      Math.sin(x * 0.03 - seed) * Math.cos(y * 0.01 + seed) +
      1) /
    2
  )
}

export function candleColumns(seed: number, width: number, height: number, count: number): Candle[][] {
  const spacing = width / count
  const columns: Candle[][] = []
  for (let column = 0; column < count; column++) {
    const candles: Candle[] = []
    let y = 0
    while (y < height) {
      const value = noise(column * spacing, y, seed)
      if (value > 0.5) {
        const candleHeight = 10 + value * 30
        candles.push({ y: y + candleHeight / 2, height: candleHeight, width: 2 + value * 3 })
        y += candleHeight + 15
      } else {
        y += 15
      }
    }
    columns.push(candles)
  }
  return columns
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by)
}

export function pointerInfluence(pointer: Point, x: number, y: number): number {
  return Math.max(0, 1 - distance(x, y, pointer.x, pointer.y) / POINTER_RADIUS)
}

export function rippleInfluence(ripples: Ripple[], x: number, y: number, now: number): number {
  let total = 0
  for (const ripple of ripples) {
    const age = now - ripple.time
    if (age >= RIPPLE_DURATION_MS) continue
    const offset = Math.abs(distance(x, y, ripple.x, ripple.y) - (age / RIPPLE_DURATION_MS) * RIPPLE_SPEED)
    if (offset < RIPPLE_BAND)
      total += (1 - age / RIPPLE_DURATION_MS) * ripple.intensity * (1 - offset / RIPPLE_BAND)
  }
  return Math.min(total, 1.5)
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function morphProgress(phase: number): number {
  const rising = clamp01((phase - Math.PI * 0.1) / (Math.PI * 0.8))
  const falling = 1 - clamp01((phase - Math.PI * 1.1) / (Math.PI * 0.8))
  const t = phase < Math.PI ? rising : falling
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]
}
