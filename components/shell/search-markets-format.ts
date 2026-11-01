const MAX_PERP_DECIMALS = 6
const MAX_SIGNIFICANT_FIGURES = 5

function priceDecimals(price: number, szDecimals: number): number {
  const maxDecimals = Math.max(0, MAX_PERP_DECIMALS - szDecimals)
  const magnitude = Math.floor(Math.log10(Math.abs(price)))
  const significantDecimals = Math.max(0, MAX_SIGNIFICANT_FIGURES - 1 - magnitude)
  return Math.min(maxDecimals, significantDecimals)
}

export function formatMarketPrice(price: number | null, szDecimals: number): string {
  if (price === null || !Number.isFinite(price) || price <= 0) return "—"
  const decimals = priceDecimals(price, szDecimals)
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

export function formatMarketCompact(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) return "—"
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export function formatMarketChange(change: number): string {
  return `${change < 0 ? "-" : "+"}${Math.abs(change * 100).toFixed(2)}%`
}

export function marketTicker(name: string): string {
  const index = name.indexOf(":")
  return index >= 0 ? name.slice(index + 1) : name
}

export function marketTradeHref(name: string): string {
  return `/trade/${encodeURIComponent(name).replace(/%3A/gi, ":")}`
}
