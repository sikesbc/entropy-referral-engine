import { formatFeedUsd } from "@/lib/feed/format"

export function SignedUsd({ value }: { value: number | null }) {
  if (value == null) return <span className="text-ink-quiet">—</span>
  return <span className={value < 0 ? "text-down" : "text-up"}>{formatFeedUsd(value, true)}</span>
}
