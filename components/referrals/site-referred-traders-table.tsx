import { TraderIdentity } from "@/components/site/trader-identity"
import { Usd } from "@/components/site/usd"
import { SortHeader } from "@/components/ui/sort-header"
import type { ReferredTrader } from "@/lib/referral-site/types"
import { cn } from "@/lib/utils"
import { EMPTY_VALUE, formatShortDate } from "./referral-format"
import {
  TABLE_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_HEADER_CELL_CLASS,
  TABLE_NUMBER_CELL_CLASS,
  TABLE_ROW_CLASS,
} from "./referral-styles"

export type TraderSortKey = "joined" | "volume" | "fees" | "earned"

export type TraderSortState = { key: TraderSortKey; desc: boolean }

const SORT_VALUE: Record<TraderSortKey, (trader: ReferredTrader) => number> = {
  joined: (trader) => Date.parse(trader.joinedAt),
  volume: (trader) => Number(trader.volumeUsd),
  fees: (trader) => Number(trader.feesPaidUsd),
  earned: (trader) => Number(trader.earnedUsd),
}

export function sortTraders(traders: ReferredTrader[], sort: TraderSortState): ReferredTrader[] {
  const value = SORT_VALUE[sort.key]
  return [...traders].sort((a, b) => (sort.desc ? value(b) - value(a) : value(a) - value(b)))
}

export function SiteReferredTradersTable({
  traders,
  sort,
  onSort,
}: {
  traders: ReferredTrader[]
  sort: TraderSortState
  onSort: (key: TraderSortKey) => void
}) {
  const header = (key: TraderSortKey, label: string, className: string) => (
    <SortHeader
      label={label}
      isActive={sort.key === key}
      isDescending={sort.desc}
      onSort={() => onSort(key)}
      isRightAligned={key !== "joined"}
      className={className}
    />
  )

  return (
    <div className="overflow-x-auto">
      <table className={TABLE_CLASS}>
        <thead className={TABLE_HEAD_CLASS}>
          <tr>
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "pl-0")}>
              Trader
            </th>
            {header("joined", "Joined", "hidden sm:table-cell")}
            {header("volume", "Volume", "text-right")}
            {header("fees", "Fees counted", "hidden text-right sm:table-cell")}
            {header("earned", "Your earnings", "pr-0 text-right")}
          </tr>
        </thead>
        <tbody>
          {traders.map((trader) => {
            const traded = trader.firstTradeAt !== null
            return (
              <tr key={trader.address} className={TABLE_ROW_CLASS}>
                <td className="max-w-[18rem] py-3 pl-0 pr-2 font-sans">
                  <TraderIdentity address={trader.address} username={trader.username} />
                </td>
                <td className="hidden px-2 py-3 text-ink-soft sm:table-cell">
                  {formatShortDate(trader.joinedAt)}
                </td>
                <td className={cn(TABLE_NUMBER_CELL_CLASS, "text-ink")}>
                  {traded ? (
                    <Usd value={trader.volumeUsd} />
                  ) : (
                    <span className="font-sans text-[0.8125rem] text-ink-quiet">No trades yet</span>
                  )}
                </td>
                <td className={cn(TABLE_NUMBER_CELL_CLASS, "hidden text-ink-soft sm:table-cell")}>
                  {traded ? <Usd value={trader.feesPaidUsd} /> : EMPTY_VALUE}
                </td>
                <td
                  className={cn(
                    TABLE_NUMBER_CELL_CLASS,
                    "pr-0",
                    Number(trader.earnedUsd) > 0 ? "text-up" : "text-ink-soft",
                  )}
                >
                  {traded ? <Usd value={trader.earnedUsd} /> : EMPTY_VALUE}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
