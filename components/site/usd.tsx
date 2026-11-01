import { formatExactUsd, formatUsd } from "@/lib/referral-site/format"
import type { DecimalString } from "@/lib/referral-site/types"
import { cn } from "@/lib/utils"

export function Usd({ value, className }: { value: DecimalString; className?: string }) {
  return (
    <span title={formatExactUsd(value)} className={cn("font-mono tabular-nums", className)}>
      {formatUsd(value)}
    </span>
  )
}
