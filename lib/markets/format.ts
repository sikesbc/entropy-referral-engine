const PRICE_SIGNIFICANT_DIGITS = 5
const MAX_PERP_DECIMALS = 6

export function marketPriceDecimals(price: number, szDecimals: number): number {
  const significant = PRICE_SIGNIFICANT_DIGITS - Math.floor(Math.log10(Math.abs(price))) - 1
  return Math.max(0, Math.min(significant, MAX_PERP_DECIMALS - szDecimals))
}

export function formatMarketPrice(price: number | null, szDecimals: number): string {
  if (price === null || !Number.isFinite(price)) return "—"
  const decimals = marketPriceDecimals(price, szDecimals)
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

function scaled(value: number, decimals: number, suffix: string): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
}

export function formatMarketVolume(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) return "—"
  if (value >= 1e9) return scaled(value / 1e9, 2, "B")
  if (value >= 1e6) return scaled(value / 1e6, 2, "M")
  if (value >= 1e3) return scaled(value / 1e3, 1, "K")
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export function formatArrowChange(change: number): string {
  return `${change < 0 ? "▼" : "▲"} ${Math.abs(change * 100).toFixed(2)}%`
}

export function formatSignedChange(change: number): string {
  return `${change < 0 ? "-" : "+"}${Math.abs(change * 100).toFixed(2)}%`
}
