import type { Fill } from "@/lib/api/types/trading"

export type ClosedPosition = {
  id: string
  coin: string
  isLong: boolean
  size: number
  entryPrice: number
  exitPrice: number
  openedAt: number
  closedAt: number
  pnl: number
}

type OpenTrade = {
  coin: string
  isLong: boolean
  openedAt: number
  openSize: number
  openNotional: number
  closeSize: number
  closeNotional: number
  pnl: number
}

const EPSILON = 1e-9

function signedSize(fill: Fill): number {
  const size = Number(fill.sz)
  return fill.side === "B" ? size : -size
}

export function closedPositionsFromFills(fills: Fill[]): ClosedPosition[] {
  const sorted = [...fills].sort((a, b) => a.time - b.time || a.tid - b.tid)
  const open = new Map<string, OpenTrade>()
  const closed: ClosedPosition[] = []

  for (const fill of sorted) {
    const start = Number(fill.startPosition)
    const delta = signedSize(fill)
    const end = start + delta
    const price = Number(fill.px)
    const size = Math.abs(delta)
    let trade = open.get(fill.coin)

    if (!trade || Math.abs(start) < EPSILON) {
      trade = {
        coin: fill.coin,
        isLong: delta > 0,
        openedAt: fill.time,
        openSize: 0,
        openNotional: 0,
        closeSize: 0,
        closeNotional: 0,
        pnl: 0,
      }
      open.set(fill.coin, trade)
    }

    const growing = Math.abs(end) > Math.abs(start) && Math.sign(end) === Math.sign(start || delta)
    if (growing) {
      trade.openSize += size
      trade.openNotional += size * price
    } else {
      trade.closeSize += size
      trade.closeNotional += size * price
    }
    trade.pnl += Number(fill.closedPnl) - Number(fill.fee)

    if (Math.abs(end) < EPSILON && trade.openSize > 0) {
      closed.push({
        id: `${fill.coin}:${trade.openedAt}:${fill.time}`,
        coin: fill.coin,
        isLong: trade.isLong,
        size: trade.openSize,
        entryPrice: trade.openNotional / trade.openSize,
        exitPrice: trade.closeSize > 0 ? trade.closeNotional / trade.closeSize : price,
        openedAt: trade.openedAt,
        closedAt: fill.time,
        pnl: trade.pnl,
      })
      open.delete(fill.coin)
    }
  }

  return closed.sort((a, b) => b.closedAt - a.closedAt)
}
