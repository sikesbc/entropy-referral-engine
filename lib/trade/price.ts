import { formatPrice } from "@/lib/format/money"

const MAX_SIGNIFICANT_FIGURES = 5
const MAX_PERP_DECIMALS = 6
const MIN_CHANGE_DECIMALS = 3
const MAX_CHANGE_DECIMALS = 6

export function priceDecimals(price: number, szDecimals: number): number {
  const maxDecimals = Math.max(0, MAX_PERP_DECIMALS - szDecimals)
  if (!Number.isFinite(price) || price <= 0) return Math.min(2, maxDecimals)
  const integerDigits = Math.floor(Math.log10(price)) + 1
  return Math.max(0, Math.min(maxDecimals, MAX_SIGNIFICANT_FIGURES - integerDigits))
}

export function formatMarketPrice(value: number, decimals: number): string {
  return `$${formatPrice(value, decimals)}`
}

function changeDecimals(magnitude: number): number {
  if (magnitude >= 1000) return 0
  if (magnitude >= 100) return 1
  if (magnitude >= 10) return 2
  for (let decimals = MIN_CHANGE_DECIMALS; decimals < MAX_CHANGE_DECIMALS; decimals++) {
    const scaled = magnitude * 10 ** decimals
    if (Math.abs(scaled - Math.round(scaled)) < 1e-6) return decimals
  }
  return MAX_CHANGE_DECIMALS
}

export function formatPriceChange(delta: number): string {
  const magnitude = Math.abs(delta)
  return `$${formatPrice(magnitude, changeDecimals(magnitude))}`
}

export function formatChangePercent(ratio: number): string {
  return `${Math.abs(ratio * 100).toFixed(2)}%`
}

export type PriceParts = { whole: string; fraction: string }

export function splitPrice(value: number, decimals: number): PriceParts {
  const [whole, fraction = ""] = formatPrice(value, decimals).split(".")
  return { whole, fraction }
}
