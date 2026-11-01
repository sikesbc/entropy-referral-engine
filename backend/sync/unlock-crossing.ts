import Big from "big.js"
import { UNLOCK_VOLUME_USD } from "@/lib/referral-site/market-programs"

export type VolumeFill = { coin: string; time: number; tid: number; px: string; sz: string }

export function findUnlockCrossings(
  fills: VolumeFill[],
  threshold: number = UNLOCK_VOLUME_USD,
): Map<string, number> {
  const totals = new Map<string, Big>()
  const crossings = new Map<string, number>()
  const ordered = [...fills].sort((a, b) => a.time - b.time || a.tid - b.tid)
  for (const fill of ordered) {
    if (crossings.has(fill.coin)) continue
    const total = (totals.get(fill.coin) ?? new Big(0)).plus(new Big(fill.px).times(fill.sz))
    totals.set(fill.coin, total)
    if (total.gte(threshold)) crossings.set(fill.coin, fill.time)
  }
  return crossings
}
