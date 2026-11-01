import type { DecimalString } from "./types"

type DecimalParts = { negative: boolean; whole: string; fraction: string }

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})
const exactTimeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
})

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function decimalParts(value: DecimalString): DecimalParts {
  const trimmed = value.trim()
  const [rawWhole = "0", rawFraction = ""] = trimmed.replace(/^[-+]/, "").split(".")
  const whole = rawWhole.replace(/^0+(?=\d)/, "") || "0"
  const fraction = rawFraction.replace(/0+$/, "")
  const negative = trimmed.startsWith("-") && (whole !== "0" || fraction !== "")
  return { negative, whole, fraction }
}

function groupThousands(whole: string): string {
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function dollars(negative: boolean, whole: string, fraction: string): string {
  return `${negative ? "-" : ""}$${groupThousands(whole)}${fraction ? `.${fraction}` : ""}`
}

export function isZero(value: DecimalString): boolean {
  const { whole, fraction } = decimalParts(value)
  return whole === "0" && fraction === ""
}

export function splitExactUsd(value: DecimalString): { lead: string; tail: string } {
  const { negative, whole, fraction } = decimalParts(value)
  const padded = fraction.padEnd(2, "0")
  const firstSignificant = padded.search(/[1-9]/)
  const leadDigits = whole === "0" && firstSignificant >= 2 ? firstSignificant + 2 : 2
  const leadFraction = padded.slice(0, leadDigits).padEnd(2, "0")
  return { lead: dollars(negative, whole, leadFraction), tail: padded.slice(leadDigits) }
}

export function formatExactUsd(value: DecimalString): string {
  const { lead, tail } = splitExactUsd(value)
  return `${lead}${tail}`
}

export function formatRoundedUsd(value: DecimalString, decimals = 2): string {
  const { negative, whole, fraction } = decimalParts(value)
  const padded = fraction.padEnd(decimals + 1, "0")
  const units = BigInt(`${whole}${padded.slice(0, decimals)}`)
  const rounded = Number(padded[decimals]) >= 5 ? units + BigInt(1) : units
  const digits = rounded.toString().padStart(decimals + 1, "0")
  const roundedWhole = decimals ? digits.slice(0, -decimals) : digits
  const roundedFraction = decimals ? digits.slice(-decimals) : ""
  return dollars(negative && rounded > BigInt(0), roundedWhole, roundedFraction)
}

export function absDecimal(value: DecimalString): DecimalString {
  return value.trim().replace(/^[-+]/, "")
}

export function isNegative(value: DecimalString): boolean {
  return decimalParts(value).negative
}

export function formatUsd(value: DecimalString): string {
  const { negative, whole, fraction } = decimalParts(value)
  const firstSignificant = fraction.search(/[1-9]/)
  if (whole !== "0" || firstSignificant < 2) return formatRoundedUsd(value)
  const places = firstSignificant + 2
  const rounded = formatRoundedUsd(absDecimal(value), places).replace(/(\.\d\d\d*?)0+$/, "$1")
  return negative ? `-${rounded}` : rounded
}

export function formatPercent(share: DecimalString): string {
  const { whole, fraction } = decimalParts(share)
  const scaled = `${whole}${fraction.padEnd(2, "0").slice(0, 2)}`.replace(/^0+(?=\d)/, "")
  const rest = fraction.slice(2)
  return `${scaled}${rest ? `.${rest}` : ""}%`
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

export function formatExactTimeUtc(iso: string): string {
  return `${dateFormat.format(new Date(iso))}, ${exactTimeFormat.format(new Date(iso))} UTC`
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const elapsed = now - new Date(iso).getTime()
  if (elapsed < MINUTE_MS) return "just now"
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`
  if (elapsed < 30 * DAY_MS) return `${Math.floor(elapsed / DAY_MS)}d ago`
  return formatDate(iso)
}

export function formatMarket(coin: string): string {
  return coin.replace(/^io:/, "")
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US")
}
