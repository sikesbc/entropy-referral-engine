import { formatPx } from "@/lib/profile/format"
import { TABLE_CELL_CLASS } from "./profile-styles"

export function PricePathCell({ from, to }: { from: number | null; to: number | null }) {
  return (
    <td className={TABLE_CELL_CLASS}>
      <span className="flex items-center gap-2 font-mono text-[0.875rem] tabular-nums">
        <span className="text-ink-soft">{formatPx(from)}</span>
        <span className="text-ink-quiet">→</span>
        <span className="text-ink">{formatPx(to)}</span>
      </span>
    </td>
  )
}
