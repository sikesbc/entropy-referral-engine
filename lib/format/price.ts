import { formatPrice } from "./money"

const MAX_PERP_DECIMALS = 6
const MAX_SIGNIFICANT_FIGURES = 5

export function marketPriceDecimals(value: number, szDecimals: number): number {
  const maxDecimals = Math.max(0, MAX_PERP_DECIMALS - szDecimals)
  const magnitude = Math.abs(value)
  const integerDigits = magnitude >= 1 ? Math.floor(Math.log10(magnitude)) + 1 : 0
  return Math.max(0, Math.min(maxDecimals, MAX_SIGNIFICANT_FIGURES - integerDigits))
}

export function formatMarketPrice(value: number, szDecimals: number): string {
  return `$${formatPrice(value, marketPriceDecimals(value, szDecimals))}`
}
