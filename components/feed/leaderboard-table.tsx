import type { ReactNode } from "react"
import { SignedUsd } from "./signed-usd"
import { SortableHeader } from "./sortable-header"
import { TopAssets } from "./top-assets"
import type { LeaderboardRow, LeaderboardSortColumn, SortDirection } from "./leaderboard-model"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import { formatFeedUsd } from "@/lib/feed/format"
import type { FeedTrader, MarketMap } from "@/lib/feed/trade-event"
import { cn } from "@/lib/utils"

const VALUE_CELL = "px-2 py-3 text-right tabular-nums"
const ROW_CLASS =
  "border-t border-line-soft font-mono cursor-pointer transition-colors hover:bg-ink/4 dark:hover:bg-ink/8"

export function LeaderboardTable({
  rows,
  window,
  showsClimb,
  markets,
  sortColumn,
  sortDirection,
  onSort,
  selectedAddress,
  onSelect,
  followAction,
}: {
  rows: LeaderboardRow[]
  window: string
  showsClimb: boolean
  markets: MarketMap
  sortColumn: LeaderboardSortColumn
  sortDirection: SortDirection
  onSort: (column: LeaderboardSortColumn) => void
  selectedAddress: string | null
  onSelect: (trader: FeedTrader) => void
  followAction: (trader: FeedTrader) => ReactNode
}) {
  const header = (column: LeaderboardSortColumn, label: string, className: string) => (
    <SortableHeader
      label={label}
      isActive={sortColumn === column}
      isDescending={sortDirection === "descending"}
      onSort={() => onSort(column)}
      className={className}
    />
  )
  const windowLabel = window.toUpperCase()
  return (
    <div className="@container">
      <table className="w-full whitespace-nowrap text-left text-[0.875rem]">
        <thead className="text-[0.75rem] text-ink-quiet">
          <tr>
            {header("rank", "#", "hidden w-9 @3xl:table-cell")}
            <th scope="col" className="px-2 py-3 font-medium">
              Trader
            </th>
            {showsClimb ? (
              <th scope="col" className="px-2 py-3 font-medium text-right">
                Climb
              </th>
            ) : null}
            {header("account_value", "Account value", "hidden text-right @2xl:table-cell")}
            {header("window_pnl", `${windowLabel} P&L`, "text-right")}
            {header("window_volume", `${windowLabel} Volume`, "hidden text-right @4xl:table-cell")}
            {header("open_pnl", "Open P&L", "hidden text-right @2xl:table-cell")}
            <th scope="col" className="px-2 py-3 font-medium hidden pl-4 @3xl:table-cell">
              Top assets
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = row.trader.address === selectedAddress
            return (
              <tr
                key={row.trader.address}
                onClick={() => onSelect(row.trader)}
                className={cn(ROW_CLASS, isSelected && "bg-ink/4 dark:bg-ink/8")}
              >
                <td className="hidden px-2 py-3 tabular-nums text-ink-quiet @3xl:table-cell">{row.rank}</td>
                <td className="max-w-[18rem] px-2 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <WalletAvatar
                      seed={row.trader.address}
                      src={row.trader.avatarUrl}
                      size="2.25rem"
                      className="shrink-0 rounded-[0.5rem]"
                    />
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelect(row.trader)
                      }}
                      className="min-w-0 truncate text-left font-sans text-[0.9375rem] font-semibold text-ink hover:underline"
                    >
                      {row.trader.name}
                    </button>
                    <span className="shrink-0 font-sans" onClick={(event) => event.stopPropagation()}>
                      {followAction(row.trader)}
                    </span>
                  </span>
                </td>
                {showsClimb ? (
                  <td className={VALUE_CELL}>
                    {row.rankJump != null && row.previousRank != null ? (
                      <span className="flex flex-col items-end gap-0.5">
                        <span className="font-semibold text-up">+{row.rankJump.toLocaleString()}</span>
                        <span className="text-[0.71875rem] text-ink-quiet">
                          #{row.previousRank.toLocaleString()} → #
                          {(row.previousRank - row.rankJump).toLocaleString()}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                ) : null}
                <td className={cn(VALUE_CELL, "hidden font-semibold text-ink @2xl:table-cell")}>
                  {row.accountValue == null ? "—" : formatFeedUsd(row.accountValue)}
                </td>
                <td className={VALUE_CELL}>
                  <SignedUsd value={row.windowPnlUsd} />
                </td>
                <td className={cn(VALUE_CELL, "hidden text-ink @4xl:table-cell")}>
                  {formatFeedUsd(row.windowVolumeUsd)}
                </td>
                <td className={cn(VALUE_CELL, "hidden @2xl:table-cell")}>
                  <SignedUsd value={row.openPnlUsd} />
                </td>
                <td className="hidden px-2 py-3 pl-4 @3xl:table-cell">
                  <TopAssets
                    positions={row.topPositions}
                    positionCount={row.positionCount}
                    markets={markets}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
