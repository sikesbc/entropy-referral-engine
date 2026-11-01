export const TRADE_URL = process.env.NEXT_PUBLIC_TRADE_URL ?? "https://entropy.io/trade"

export const ENTROPY_SHARE = "0.5"
export const REFERRER_SHARE = "0.5"

export function referralUrl(origin: string, code: string): string {
  return `${origin}/r/${encodeURIComponent(code)}`
}

export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "")
}
