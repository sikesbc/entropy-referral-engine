import { formatSignedUsd } from "@/lib/profile/format"
import { cn } from "@/lib/utils"
import { TABLE_CELL_CLASS } from "./profile-styles"

export function PnlCell({ pnl }: { pnl: number | null }) {
  return (
    <td className={cn(TABLE_CELL_CLASS, "text-right")}>
      <b
        className={cn(
          "block font-mono text-[0.9375rem] font-medium tabular-nums",
          pnl === null ? "text-ink-quiet" : pnl < 0 ? "text-down" : "text-up",
        )}
      >
        {pnl === null ? "—" : formatSignedUsd(pnl)}
      </b>
    </td>
  )
}
