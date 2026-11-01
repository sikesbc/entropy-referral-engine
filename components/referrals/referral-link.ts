export function referralLink(origin: string, code: string): string {
  return `${origin}/?r=${encodeURIComponent(code)}`
}
