"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function FollowButton({ isFollowing, className }: { isFollowing: boolean; className?: string }) {
  const [override, setOverride] = useState<boolean | null>(null)
  const active = override ?? isFollowing
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => setOverride(!active)}
      className={cn(
        "inline-flex h-[1.625rem] shrink-0 items-center justify-center whitespace-nowrap rounded-[0.4375rem] px-2.5 text-[0.75rem] font-medium transition-colors disabled:opacity-60",
        active
          ? "bg-panel-3 text-ink-soft dark:bg-panel"
          : "border border-line bg-panel text-ink hover:bg-panel-3",
        className,
      )}
    >
      {active ? "Following" : "Follow"}
    </button>
  )
}
