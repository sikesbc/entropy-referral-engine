import { cn } from "@/lib/utils"
import { formatMarketChange } from "./search-markets-format"

export function SearchMarketsChange({ change, className }: { change: number | null; className?: string }) {
  if (change === null) return <span className="font-mono text-ink-quiet">—</span>
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[0.25rem] px-1 py-px font-mono tabular-nums",
        change < 0 ? "bg-down-bg text-down" : "bg-up-bg text-up",
        className,
      )}
    >
      {formatMarketChange(change)}
    </span>
  )
}
