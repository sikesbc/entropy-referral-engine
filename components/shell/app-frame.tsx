"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { isViewportLockedRoute } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div
      className={cn(
        "entropy-trade flex min-h-dvh flex-col bg-bg text-ink",
        isViewportLockedRoute(pathname) && "lg:h-dvh lg:overflow-hidden",
      )}
    >
      {children}
    </div>
  )
}
