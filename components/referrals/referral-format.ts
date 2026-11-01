import { formatUsd } from "@/lib/format/money"

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const longDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })

export const EMPTY_VALUE = "—"

export function formatRate(ratio: number): string {
  return `${Number((ratio * 100).toFixed(1))}%`
}

export function formatCount(value: number): string {
  return integer.format(value)
}

export function formatEarned(value: number): string {
  return formatUsd(value)
}

function withSuffix(value: number, decimals: number, suffix: string): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return EMPTY_VALUE
  if (value >= 1e9) return withSuffix(value / 1e9, 2, "B")
  if (value >= 1e6) return withSuffix(value / 1e6, 2, "M")
  if (value >= 1e3) return withSuffix(value / 1e3, 1, "K")
  return `$${integer.format(value)}`
}

export function formatShortDate(iso: string | null | undefined): string {
  const time = iso ? Date.parse(iso) : Number.NaN
  return Number.isFinite(time) ? shortDate.format(time) : EMPTY_VALUE
}

export function formatLongDate(time: number): string {
  return longDate.format(time)
}
