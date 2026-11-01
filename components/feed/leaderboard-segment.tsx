"use client"

import { useMemo, useState, type ReactNode } from "react"
import { FeedEmptyState } from "./feed-empty-state"
import { FeedViewHeader } from "./feed-view-header"
import { LeaderboardTable } from "./leaderboard-table"
import { SkeletonList } from "./skeleton-list"
import { TablePager } from "@/components/ui/table-pager"
import {
  leaderboardRow,
  paginate,
  sortLeaderboardRows,
  type LeaderboardSortColumn,
  type SortDirection,
} from "./leaderboard-model"
import { useTopTraders } from "@/lib/api/discovery"
import { useWalletIdentityMap } from "@/lib/api/social"
import { traderFromIdentity, type FeedTrader, type MarketMap } from "@/lib/feed/trade-event"
import type { LeaderboardView } from "@/lib/feed/views"

const PAGE_SIZE = 10

export function LeaderboardSegment({
  view,
  markets,
  sortColumn,
  sortDirection,
  onSort,
  selectedAddress,
  onSelect,
  followAction,
}: {
  view: LeaderboardView
  markets: MarketMap
  sortColumn: LeaderboardSortColumn
  sortDirection: SortDirection
  onSort: (column: LeaderboardSortColumn) => void
  selectedAddress: string | null
  onSelect: (trader: FeedTrader) => void
  followAction: (trader: FeedTrader) => ReactNode
}) {
  const query = useTopTraders({ window: view.window, order: view.order, known: view.isKnownOnly })
  const traders = useMemo(() => query.data?.traders ?? [], [query.data])
  const unknownAddresses = useMemo(
    () => traders.filter((trader) => !trader.wallet).map((trader) => trader.address),
    [traders],
  )
  const { traderFor } = useWalletIdentityMap(unknownAddresses)
  const rows = useMemo(
    () =>
      sortLeaderboardRows(
        traders.map((trader, index) =>
          leaderboardRow(
            trader.wallet ? traderFromIdentity(trader.wallet) : traderFor(trader.address),
            trader,
            index,
          ),
        ),
        sortColumn,
        sortDirection,
      ),
    [traders, traderFor, sortColumn, sortDirection],
  )
  const [pageState, setPageState] = useState({ page: 0, sortKey: `${sortColumn}:${sortDirection}` })
  const sortKey = `${sortColumn}:${sortDirection}`
  const page = pageState.sortKey === sortKey ? pageState.page : 0
  const pager = paginate(rows, page, PAGE_SIZE)

  return (
    <>
      <FeedViewHeader title={view.title} />
      {query.isError && !query.data ? (
        <FeedEmptyState
          text="Couldn’t load the leaderboard."
          action={{ label: "Try again", onClick: () => void query.refetch() }}
        />
      ) : query.data ? (
        rows.length ? (
          <>
            <LeaderboardTable
              rows={pager.pageItems}
              window={view.window}
              showsClimb={view.order === "rank_climb"}
              markets={markets}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              selectedAddress={selectedAddress}
              onSelect={onSelect}
              followAction={followAction}
            />
            <TablePager
              pager={pager}
              className="px-0 before:inset-x-0"
              onPageChange={(next) => setPageState({ page: next, sortKey })}
            />
          </>
        ) : (
          <FeedEmptyState text="No traders in this group right now." />
        )
      ) : (
        <SkeletonList
          label="Loading positions"
          count={PAGE_SIZE}
          className="gap-2.5"
          itemClassName="h-[4.5rem] rounded-[0.5rem]"
        />
      )}
    </>
  )
}
