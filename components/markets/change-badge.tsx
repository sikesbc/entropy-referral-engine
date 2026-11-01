import { formatSignedChange } from "@/lib/markets/format"
import { cn } from "@/lib/utils"

export function ChangeBadge({ change, className }: { change: number | null; className?: string }) {
  if (change === null) return <span className={cn("font-mono text-ink-quiet", className)}>—</span>
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[0.25rem] px-1 py-px font-mono tabular-nums",
        change < 0 ? "bg-down-bg text-down" : "bg-up-bg text-up",
        className,
      )}
    >
      {formatSignedChange(change)}
    </span>
  )
}
