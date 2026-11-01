import { formatUsd } from "@/lib/format/money"
import { cn } from "@/lib/utils"

export function EarningsChange({ change, label, title }: { change: number; label?: string; title?: string }) {
  const falling = change < 0
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full pl-2 pr-2.5 font-mono text-[0.9375rem] font-medium tabular-nums transition-colors duration-300",
        change === 0
          ? "bg-panel-2 text-ink dark:bg-panel-3"
          : falling
            ? "bg-down-bg text-down"
            : "bg-up-bg text-up",
      )}
    >
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className={cn("size-3", falling && "rotate-180")}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 10V2.5M2.5 6 6 2.5 9.5 6" />
      </svg>
      {label ?? formatUsd(Math.abs(change))}
    </span>
  )
}
