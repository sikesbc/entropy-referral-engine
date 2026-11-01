import { formatUsd } from "@/lib/format/money"
import { cn } from "@/lib/utils"
import { BODY_CELL } from "./activity-cells"

export function PnlCell({ pnl, detail }: { pnl: number | null; detail?: string }) {
  const tone = pnl === null || pnl === 0 ? "text-ink" : pnl > 0 ? "text-up" : "text-down"
  const sign = pnl !== null && pnl > 0 ? "+" : pnl !== null && pnl < 0 ? "-" : ""
  return (
    <td className={BODY_CELL}>
      <b className={cn("block font-mono text-[0.9375rem] font-medium tabular-nums", tone)}>
        {pnl === null ? "—" : `${sign}${formatUsd(Math.abs(pnl))}`}
      </b>
      {detail ? (
        <small className="mt-1 block font-mono text-[0.8125rem] text-ink-quiet">{detail}</small>
      ) : null}
    </td>
  )
}
