import "server-only"
import { getFillsByTime, getSubAccounts, type HyperliquidFill } from "@/backend/hyperliquid/info"

export const PAGE_SIZE = 500
export const HISTORY_CAP = 10000

export type FillsResult = { fills: HyperliquidFill[]; possibleGap: boolean }

export type FillSource = {
  subAccounts(root: string): Promise<string[]>
  fillsSince(address: string, startMs: number): Promise<FillsResult>
}

export async function collectFills(
  fetchPage: (startMs: number) => Promise<HyperliquidFill[]>,
  startMs: number,
): Promise<FillsResult> {
  const seen = new Map<number, HyperliquidFill>()
  let cursor = startMs
  let stalled = false

  for (;;) {
    const page = await fetchPage(cursor)
    for (const fill of page) seen.set(fill.tid, fill)
    if (page.length < PAGE_SIZE) break
    const next = Math.max(...page.map((fill) => fill.time))
    if (next <= cursor) {
      stalled = true
      break
    }
    cursor = next
  }

  const fills = [...seen.values()].sort((a, b) => a.time - b.time || a.tid - b.tid)
  return { fills, possibleGap: stalled || fills.length >= HISTORY_CAP }
}

export function liveFillSource(): FillSource {
  return {
    async subAccounts(root) {
      const accounts = await getSubAccounts(root)
      return accounts.map((account) => account.subAccountUser.toLowerCase())
    },
    fillsSince(address, startMs) {
      return collectFills((start) => getFillsByTime(address, start), startMs)
    },
  }
}
