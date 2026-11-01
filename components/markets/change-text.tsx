import { formatArrowChange } from "@/lib/markets/format"
import { cn } from "@/lib/utils"

export function ChangeText({ change, className }: { change: number | null; className?: string }) {
  if (change === null) return <span className={cn("font-mono text-ink-quiet", className)}>—</span>
  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums tracking-[-0.03em]",
        change < 0 ? "text-down" : "text-up",
        className,
      )}
    >
      {formatArrowChange(change)}
    </span>
  )
}
