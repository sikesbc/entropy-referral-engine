import { FeedSkeleton } from "./feed-skeleton"
import { cn } from "@/lib/utils"

export function SkeletonList({
  label,
  count,
  className,
  itemClassName,
}: {
  label: string
  count: number
  className: string
  itemClassName: string
}) {
  return (
    <div aria-label={label} role="progressbar" className={cn("flex flex-col", className)}>
      {Array.from({ length: count }, (_, index) => (
        <FeedSkeleton key={index} className={itemClassName} />
      ))}
    </div>
  )
}
