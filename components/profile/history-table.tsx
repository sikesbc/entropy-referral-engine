import { formatUsd } from "@/lib/format/money"
import type { ClosedPosition } from "@/lib/profile/closed-positions"
import { formatDuration, formatSize, formatTradeTime, marketSymbol } from "@/lib/profile/format"
import { ActivityTableHead } from "./activity-table-head"
import { MarketCell } from "./market-cell"
import { PnlCell } from "./pnl-cell"
import { PricePathCell } from "./price-path-cell"
import { TABLE_CELL_CLASS } from "./profile-styles"

const COLUMNS = ["Market", "Opened at → closed at", "Size", "Result"]

export function HistoryTable({ closed }: { closed: ClosedPosition[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <ActivityTableHead columns={COLUMNS} />
        <tbody>
          {closed.map((trade) => (
            <tr key={trade.id} className="border-t border-line-soft">
              <MarketCell
                coin={trade.coin}
                isLong={trade.isLong}
                leverage={null}
                detail={`${formatTradeTime(trade.openedAt)} → ${formatTradeTime(trade.closedAt)} · held ${formatDuration(trade.closedAt - trade.openedAt)}`}
              />
              <PricePathCell from={trade.entryPrice} to={trade.exitPrice} />
              <td className={TABLE_CELL_CLASS}>
                <b className="block font-mono text-[0.9375rem] font-medium tabular-nums text-ink">
                  {formatUsd(trade.size * trade.exitPrice)}
                </b>
                <small className="mt-1 block font-sans text-[0.8125rem] text-ink-quiet">
                  {formatSize(trade.size)} {marketSymbol(trade.coin)}
                </small>
              </td>
              <PnlCell pnl={trade.pnl} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
