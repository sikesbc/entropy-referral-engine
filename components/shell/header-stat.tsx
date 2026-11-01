import { formatUsd } from "@/lib/format/money"
import { cn } from "@/lib/utils"

export function HeaderStat({
  label,
  value,
  className,
}: {
  label: string
  value: number | null
  className?: string
}) {
  return (
    <span className={cn("flex flex-col items-start gap-0.5 leading-none", className)}>
      <span className="text-[0.625rem] text-ink-quiet">{label}</span>
      {value === null ? (
        <span className="text-[0.875rem] text-ink-quiet">—</span>
      ) : (
        <span className="text-[0.875rem] font-medium tabular-nums tracking-[-0.01em] text-ink">
          {formatUsd(value)}
        </span>
      )}
    </span>
  )
}
