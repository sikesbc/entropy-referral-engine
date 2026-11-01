"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef } from "react"
import { SlidingHighlight } from "@/components/ui/sliding-highlight"
import { useMeasuredBox } from "@/hooks/use-measured-box"
import { isNavItemActive, NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function Nav() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const box = useMeasuredBox(navRef, '[aria-current="page"]', pathname)

  return (
    <nav ref={navRef} aria-label="Pages" className="relative ml-1 flex items-center gap-0.5">
      <SlidingHighlight box={box} className="rounded-[0.4375rem] bg-panel-2 dark:bg-panel-3" />
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(item, pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative z-[1] rounded-[0.4375rem] px-2 py-1 transition-colors sm:px-2.5",
              active ? "text-ink" : "text-ink-soft hover:text-ink",
              item.desktopOnly && "hidden sm:inline-block",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
