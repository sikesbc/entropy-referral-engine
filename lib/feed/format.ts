import type { WalletIdentity } from "@/lib/api/types/discovery"

const compactUsd = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const centsUsd = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const SIGNIFICANT_FIGURES = 5
const MIN_PRICE_DECIMALS = 2
const MAX_PRICE_DECIMALS = 10

export function formatFeedUsd(value: number, signed = false): string {
  const magnitude = Math.abs(value)
  const body = magnitude >= 1e4 ? compactUsd.format(magnitude) : centsUsd.format(magnitude)
  const sign = signed ? (value < 0 ? "-" : "+") : ""
  return `${sign}$${body}`
}

function fallbackPriceDecimals(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return MIN_PRICE_DECIMALS
  if (price >= 1) {
    const integerDigits = Math.floor(Math.log10(price)) + 1
    return Math.max(MIN_PRICE_DECIMALS, SIGNIFICANT_FIGURES - integerDigits)
  }
  const leadingZeros = Math.max(0, -Math.floor(Math.log10(price)) - 1)
  return Math.min(leadingZeros + SIGNIFICANT_FIGURES, MAX_PRICE_DECIMALS)
}

function perpPriceDecimals(price: number, szDecimals: number): number {
  const significant = SIGNIFICANT_FIGURES - Math.floor(Math.log10(Math.abs(price))) - 1
  return Math.max(0, Math.min(significant, 6 - szDecimals))
}

export function formatMarketPrice(price: number, szDecimals: number | null): string {
  const decimals =
    szDecimals == null ? fallbackPriceDecimals(Math.abs(price)) : perpPriceDecimals(price, szDecimals)
  return price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function formatAgo(from: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - from) / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`
}

export function formatHeld(durationMs: number): string {
  const minutes = Math.floor(durationMs / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)}m`
  const hours = Math.floor(minutes / 60)
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d ${hours % 24}h`
}

export function formatReturn(fraction: number): string {
  return `${fraction < 0 ? "-" : "+"}${Math.abs(fraction * 100).toFixed(2)}%`
}

export function identityHandle(
  identity: Pick<WalletIdentity, "entropyUsername" | "xUsername" | "shortAddress">,
): string {
  if (identity.entropyUsername) return `@${identity.entropyUsername}`
  if (identity.xUsername) return `@${identity.xUsername}`
  return identity.shortAddress
}
