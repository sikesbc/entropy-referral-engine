import { formatChangePercent, formatPriceChange } from "@/lib/trade/price"
import { cn } from "@/lib/utils"

type PriceChangeProps = { change: number; reference: number; periodLabel: string }

export function PriceChange({ change, reference, periodLabel }: PriceChangeProps) {
  const down = change < 0
  const ratio = reference ? change / reference : 0

  return (
    <div className="text-[0.825rem]">
      <span
        className={cn(
          "font-mono tabular-nums tracking-[-0.04em] transition-colors duration-500",
          down ? "text-down" : "text-up",
        )}
      >
        <span className={cn("inline-block transition-transform duration-500", down && "rotate-180")}>▲</span>{" "}
        {formatPriceChange(change)} ({formatChangePercent(ratio)})
        <span className="font-sans tracking-normal text-ink-quiet"> · {periodLabel}</span>
      </span>
    </div>
  )
}
