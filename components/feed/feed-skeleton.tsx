import { cn } from "@/lib/utils"

export function FeedSkeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded-[0.25rem] bg-ink/10", className)} />
}
