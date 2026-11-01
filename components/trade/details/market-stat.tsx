import { cn } from "@/lib/utils"

export type MarketStatTone = "neutral" | "up" | "down"

const TONE_CLASS: Record<MarketStatTone, string> = {
  neutral: "text-ink",
  up: "text-up",
  down: "text-down",
}

export function MarketStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: MarketStatTone
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[0.75rem] font-medium tracking-[-0.02em] text-ink-quiet">{label}</dt>
      <dd className={cn("font-mono text-[0.8125rem] tabular-nums tracking-[-0.04em]", TONE_CLASS[tone])}>
        {value}
      </dd>
    </div>
  )
}
