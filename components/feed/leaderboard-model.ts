import type { TopTrader, TopTraderPosition } from "@/lib/api/types/discovery"
import type { FeedTrader } from "@/lib/feed/trade-event"

export type LeaderboardSortColumn = "rank" | "account_value" | "window_pnl" | "window_volume" | "open_pnl"

export type SortDirection = "ascending" | "descending"

export type LeaderboardRow = {
  trader: FeedTrader
  rank: number
  order: number
  accountValue: number | null
  openPnlUsd: number
  windowPnlUsd: number
  windowVolumeUsd: number
  topPositions: TopTraderPosition[]
  positionCount: number
  previousRank: number | null
  rankJump: number | null
}

export function leaderboardRow(trader: FeedTrader, source: TopTrader, order: number): LeaderboardRow {
  return {
    trader,
    rank: source.rank,
    order,
    accountValue: source.accountValueUsd,
    openPnlUsd: source.openPnlUsd,
    windowPnlUsd: source.totalPnlUsd,
    windowVolumeUsd: source.volumeUsd,
    topPositions: source.topPositions,
    positionCount: source.positionCount,
    previousRank: source.previousRank ?? null,
    rankJump: source.rankJump ?? null,
  }
}

function sortValue(row: LeaderboardRow, column: LeaderboardSortColumn): number {
  switch (column) {
    case "rank":
      return row.order
    case "account_value":
      return row.accountValue ?? Number.NEGATIVE_INFINITY
    case "window_pnl":
      return row.windowPnlUsd
    case "window_volume":
      return row.windowVolumeUsd
    case "open_pnl":
      return row.openPnlUsd
  }
}

export function sortLeaderboardRows(
  rows: LeaderboardRow[],
  column: LeaderboardSortColumn,
  direction: SortDirection,
): LeaderboardRow[] {
  const factor = direction === "ascending" ? 1 : -1
  return [...rows].sort((a, b) => (sortValue(a, column) - sortValue(b, column)) * factor || a.order - b.order)
}

export type Pager<T> = {
  page: number
  pageCount: number
  pageItems: T[]
  from: number
  to: number
  total: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): Pager<T> {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(0, Math.trunc(page)), pageCount - 1)
  const offset = current * pageSize
  const pageItems = items.slice(offset, offset + pageSize)
  return {
    page: current,
    pageCount,
    pageItems,
    from: pageItems.length > 0 ? offset + 1 : 0,
    to: offset + pageItems.length,
    total,
  }
}
