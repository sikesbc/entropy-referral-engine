import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { EMPTY_VALUE } from "./referral-format"

export function ReferralStatValue({
  value,
  format,
  isLoading,
}: {
  value: number | null
  format: (value: number) => string
  isLoading: boolean
}) {
  if (isLoading) return <Skeleton className="h-[1.125rem] w-[4.5rem] rounded-[0.25rem]" />
  return (
    <b
      className={cn(
        "font-mono text-[1.0625rem] font-medium leading-[1.375rem] tabular-nums tracking-[-0.0125em]",
        value === null ? "text-ink-quiet" : "text-ink",
      )}
    >
      {value === null ? EMPTY_VALUE : format(value)}
    </b>
  )
}
