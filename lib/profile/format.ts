import { formatUsd } from "@/lib/format/money"

export function marketSymbol(coin: string): string {
  return coin.split(":").pop() ?? coin
}

export function formatSignedUsd(value: number): string {
  return `${value < 0 ? "−" : "+"}${formatUsd(Math.abs(value))}`
}

export function formatSize(value: number): string {
  return Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 6 })
}

export function formatPx(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—"
  const decimals = value >= 1000 ? 2 : value >= 1 ? 4 : 6
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`
}

const tradeDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatTradeTime(time: number): string {
  return tradeDate.format(time)
}

export function formatDuration(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}
