import { cn } from "@/lib/utils"

export function SearchMarketsLeverage({ leverage, className }: { leverage: number; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 items-center justify-center whitespace-nowrap rounded-full py-0 font-mono font-semibold bg-[var(--entropy-orange)]/15 text-[var(--entropy-orange)]",
        className,
      )}
    >
      {leverage}×
    </span>
  )
}
