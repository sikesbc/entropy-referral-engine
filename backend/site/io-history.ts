import "server-only"
import { getFillsByTime, getSubAccounts } from "@/backend/hyperliquid/info"
import { PAGE_SIZE } from "@/backend/sync/fill-source"

const IO_PREFIX = "io:"
const MAX_PAGES = 10

async function addressHasIoFills(address: string): Promise<boolean> {
  let startTime = 0
  for (let page = 0; page < MAX_PAGES; page++) {
    const fills = await getFillsByTime(address, startTime)
    if (fills.some((fill) => fill.coin.startsWith(IO_PREFIX))) return true
    if (fills.length < PAGE_SIZE) return false
    startTime = Math.max(...fills.map((fill) => fill.time)) + 1
  }
  return false
}

export async function hasIoHistory(root: string): Promise<boolean> {
  const subAccounts = await getSubAccounts(root)
  const addresses = [root, ...subAccounts.map((account) => account.subAccountUser.toLowerCase())]
  const results = await Promise.all(addresses.map(addressHasIoFills))
  return results.some(Boolean)
}
