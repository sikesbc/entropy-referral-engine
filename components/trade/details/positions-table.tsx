import { formatUsd } from "@/lib/format/money"
import { formatSignedPercent } from "@/lib/format/percent"
import { formatMarketPrice } from "@/lib/format/price"
import { BODY_CELL, ROW, VALUE } from "./activity-cells"
import { ActivityTableHead } from "./activity-table-head"
import { MarketCell } from "./market-cell"
import type { MarketDirectory } from "./market-directory"
import { PnlCell } from "./pnl-cell"
import type { OpenPosition } from "./use-account-activity"

const COLUMNS = ["Market", "Since you opened", "Opened at → now", "Value", "Profit / Loss"]

export function PositionsTable({
  positions,
  markets,
}: {
  positions: OpenPosition[]
  markets: MarketDirectory
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <ActivityTableHead columns={COLUMNS} />
        <tbody>
          {positions.map((position) => {
            const info = markets.lookup(position.coin)
            const price = (value: number | null) =>
              value === null ? "—" : formatMarketPrice(value, info.szDecimals)
            return (
              <tr key={position.coin} className={ROW}>
                <MarketCell
                  coin={position.coin}
                  name={info.name}
                  isLong={position.size > 0}
                  leverage={position.leverage}
                  detail={`${Math.abs(position.size)} ${info.ticker}`}
                />
                <td className={BODY_CELL}>
                  <span className={VALUE}>{formatSignedPercent(position.returnOnEquity)}</span>
                </td>
                <td className={BODY_CELL}>
                  <span className={VALUE}>
                    {price(position.entryPx)} → {price(position.markPx)}
                  </span>
                </td>
                <td className={BODY_CELL}>
                  <b className={VALUE}>{formatUsd(position.marginUsed + position.unrealizedPnl)}</b>
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
