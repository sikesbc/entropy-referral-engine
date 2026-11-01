import type { OrderSide } from "@/lib/api/types/orders"

export const AMOUNT_PRESETS = [50, 100, 500] as const
export const MOVE_PRESETS = [10, 25, 50] as const

export function leverageTicks(maxLeverage: number): number[] {
  const candidates =
    maxLeverage <= 5
      ? [1, 2, maxLeverage]
      : maxLeverage <= 10
        ? [1, 2, 5, maxLeverage]
        : [1, 5, 10, maxLeverage]
  return Array.from(new Set(candidates.filter((tick) => tick >= 1 && tick <= maxLeverage))).sort(
    (a, b) => a - b,
  )
}

export function leverageRatio(leverage: number, maxLeverage: number): number {
  if (maxLeverage <= 1) return 1
  return Math.min(1, Math.max(0, (leverage - 1) / (maxLeverage - 1)))
}

export function sanitizeDecimal(input: string): string {
  const digits = input.replace(/[^\d.]/g, "")
  const firstDot = digits.indexOf(".")
  if (firstDot === -1) return digits
  return digits.slice(0, firstDot + 1) + digits.slice(firstDot + 1).replace(/\./g, "")
}

export function parseDecimal(input: string): number {
  const value = Number(input)
  return Number.isFinite(value) ? value : 0
}

export function sideSign(side: OrderSide): 1 | -1 {
  return side === "long" ? 1 : -1
}

export function liquidationPrice(
  entry: number,
  leverage: number,
  maxLeverage: number,
  side: OrderSide,
): number {
  const maintenance = 1 / (2 * maxLeverage)
  const sign = sideSign(side)
  return entry - (sign * entry * (1 / leverage - maintenance)) / (1 - maintenance * sign)
}

export function projectedProfit(notionalUsd: number, movePercent: number, side: OrderSide): number {
  const cappedMove = side === "short" ? Math.min(100, movePercent) : movePercent
  return (notionalUsd * cappedMove) / 100
}

export function returnForPrice(entry: number, target: number, leverage: number, side: OrderSide): number {
  return (target / entry - 1) * sideSign(side) * leverage * 100
}

export function priceForReturn(
  entry: number,
  returnPercent: number,
  leverage: number,
  side: OrderSide,
): number {
  return entry * (1 + (returnPercent / 100 / leverage) * sideSign(side))
}
