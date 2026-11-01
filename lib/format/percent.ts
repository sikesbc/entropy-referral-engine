export function formatPercent(ratio: number, decimals = 2): string {
  return `${(ratio * 100).toFixed(decimals)}%`
}

export function formatSignedPercent(ratio: number, decimals = 2): string {
  const sign = ratio > 0 ? "+" : ratio < 0 ? "-" : ""
  return `${sign}${Math.abs(ratio * 100).toFixed(decimals)}%`
}
