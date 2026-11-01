import type { OpenPosition } from "@/lib/api/profile"
import { formatUsd } from "@/lib/format/money"
import { formatSize, marketSymbol } from "@/lib/profile/format"
import { ActivityTableHead } from "./activity-table-head"
import { MarketCell } from "./market-cell"
import { PnlCell } from "./pnl-cell"
import { PricePathCell } from "./price-path-cell"
import { TABLE_CELL_CLASS } from "./profile-styles"

const COLUMNS = ["Market", "Opened at → now", "Value", "Profit / Loss"]

export function PositionsTable({ positions }: { positions: OpenPosition[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <ActivityTableHead columns={COLUMNS} />
        <tbody>
          {positions.map((position) => {
            const markPrice = position.size !== 0 ? Math.abs(position.positionValue / position.size) : null
            return (
              <tr key={position.coin} className="border-t border-line-soft">
                <MarketCell
                  coin={position.coin}
                  isLong={position.size > 0}
                  leverage={position.leverage}
                  detail={`${formatSize(position.size)} ${marketSymbol(position.coin)}`}
                />
                <PricePathCell from={position.entryPrice} to={markPrice} />
                <td className={TABLE_CELL_CLASS}>
                  <b className="block font-mono text-[0.9375rem] font-medium tabular-nums text-ink">
                    {formatUsd(position.positionValue)}
                  </b>
                </td>
                <PnlCell pnl={position.unrealizedPnl} />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
