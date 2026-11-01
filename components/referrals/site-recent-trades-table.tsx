import { TraderIdentity } from "@/components/site/trader-identity"
import { Usd } from "@/components/site/usd"
import {
  absDecimal,
  formatExactTimeUtc,
  formatMarket,
  formatRelativeTime,
  isNegative,
} from "@/lib/referral-site/format"
import type { RecentTrade } from "@/lib/referral-site/types"
import { cn } from "@/lib/utils"
import {
  TABLE_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_HEADER_CELL_CLASS,
  TABLE_NUMBER_CELL_CLASS,
  TABLE_ROW_CLASS,
} from "./referral-styles"

export function SiteRecentTradesTable({ trades, now }: { trades: RecentTrade[]; now: number }) {
  return (
    <div className="overflow-x-auto">
      <table className={TABLE_CLASS}>
        <thead className={TABLE_HEAD_CLASS}>
          <tr>
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "pl-0")}>
              Time
            </th>
            <th scope="col" className={TABLE_HEADER_CELL_CLASS}>
              Trader
            </th>
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "hidden sm:table-cell")}>
              Market
            </th>
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "hidden text-right sm:table-cell")}>
              Size
            </th>
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "hidden text-right sm:table-cell")}>
              Fee
            </th>
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "pr-0 text-right")}>
              You earned
            </th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const rebate = isNegative(trade.feeUsd)
            return (
              <tr key={`${trade.address}:${trade.tid}`} className={TABLE_ROW_CLASS}>
                <td className="py-3 pl-0 pr-2 text-ink-soft" title={formatExactTimeUtc(trade.time)}>
                  {formatRelativeTime(trade.time, now)}
                </td>
                <td className="max-w-[16rem] px-2 py-3 font-sans">
                  <TraderIdentity address={trade.address} username={trade.username} />
                </td>
                <td className="hidden px-2 py-3 sm:table-cell">
                  <span className="text-ink">{formatMarket(trade.coin)}</span>{" "}
                  <span className={trade.side === "buy" ? "text-up" : "text-down"}>
                    {trade.side === "buy" ? "Buy" : "Sell"}
                  </span>
                </td>
                <td className={cn(TABLE_NUMBER_CELL_CLASS, "hidden text-ink sm:table-cell")}>
                  <Usd value={trade.sizeUsd} />
                </td>
                <td className={cn(TABLE_NUMBER_CELL_CLASS, "hidden text-ink-soft sm:table-cell")}>
                  {rebate ? (
                    <span className="font-sans text-[0.8125rem] text-ink-quiet">
                      Rebate <Usd value={absDecimal(trade.feeUsd)} />
                    </span>
                  ) : (
                    <Usd value={trade.feeUsd} />
                  )}
                </td>
                <td
                  className={cn(
                    TABLE_NUMBER_CELL_CLASS,
                    "pr-0",
                    Number(trade.earnedUsd) > 0 ? "text-up" : "text-ink-soft",
                  )}
                >
                  <Usd value={trade.earnedUsd} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
