import type { FillSource } from "./fill-source"
import type { TradedFill } from "./ingest"

export type Collected = { traded: TradedFill[]; possibleGap: boolean; cursorMs: number }

export async function collectTraded(
  address: string,
  startMs: number,
  source: FillSource,
): Promise<Collected> {
  const subAccounts = await source.subAccounts(address)
  const traders = [address, ...subAccounts.filter((trader) => trader !== address)]

  const traded: TradedFill[] = []
  let possibleGap = false
  let cursorMs = startMs
  for (const trader of traders) {
    const result = await source.fillsSince(trader, startMs)
    possibleGap ||= result.possibleGap
    for (const fill of result.fills) {
      cursorMs = Math.max(cursorMs, fill.time + 1)
      traded.push({ ...fill, traderAddress: trader })
    }
  }

  return { traded, possibleGap, cursorMs }
}
