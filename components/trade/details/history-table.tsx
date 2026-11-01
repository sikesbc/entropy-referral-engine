import { formatUsd } from "@/lib/format/money"
import { formatMarketPrice } from "@/lib/format/price"
import { BODY_CELL, DETAIL, ROW, VALUE } from "./activity-cells"
import { ActivityTableHead } from "./activity-table-head"
import { MarketCell } from "./market-cell"
import type { MarketDirectory } from "./market-directory"
import { PnlCell } from "./pnl-cell"
import type { ClosedTrade } from "./use-account-activity"

const COLUMNS = ["Market", "While you held it", "Opened at → closed at", "Size", "Result"]

const closedAtFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export function HistoryTable({ trades, markets }: { trades: ClosedTrade[]; markets: MarketDirectory }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <ActivityTableHead columns={COLUMNS} />
        <tbody>
          {trades.map((trade) => {
            const info = markets.lookup(trade.coin)
            const returnRatio =
              trade.entryPx > 0 ? (trade.exitPx / trade.entryPx - 1) * (trade.isLong ? 1 : -1) : 0
            return (
              <tr key={trade.id} className={ROW}>
                <MarketCell
                  coin={trade.coin}
                  name={info.name}
                  isLong={trade.isLong}
                  leverage={null}
                  detail={`Closed ${closedAtFormat.format(trade.closedAt)}`}
                />
                <td className={BODY_CELL}>
                  <span
                    className={VALUE}
                  >{`${returnRatio >= 0 ? "+" : ""}${(returnRatio * 100).toFixed(2)}%`}</span>
                </td>
                <td className={BODY_CELL}>
                  <span className={VALUE}>
                    {formatMarketPrice(trade.entryPx, info.szDecimals)} →{" "}
                    {formatMarketPrice(trade.exitPx, info.szDecimals)}
                  </span>
                </td>
                <td className={BODY_CELL}>
                  <b className={VALUE}>{formatUsd(trade.size * trade.exitPx)}</b>
                  <small className={DETAIL}>
                    {trade.size} {info.ticker}
                  </small>
                </td>
                <PnlCell pnl={trade.pnl} />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
