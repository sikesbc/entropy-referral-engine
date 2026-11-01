"use client"

import { ClipboardList, Info, Layers, RotateCcwClock, type LucideIcon } from "lucide-react"
import { Fragment, useRef } from "react"
import { useMeasuredBox } from "@/hooks/use-measured-box"
import { cn } from "@/lib/utils"

export type DetailTab = "about" | "positions" | "orders" | "history"

const TABS: { value: DetailTab; label: string; icon: LucideIcon }[] = [
  { value: "about", label: "About", icon: Info },
  { value: "positions", label: "Positions", icon: Layers },
  { value: "orders", label: "Orders", icon: ClipboardList },
  { value: "history", label: "History", icon: RotateCcwClock },
]

export function DetailTabs({ value, onChange }: { value: DetailTab; onChange: (value: DetailTab) => void }) {
  const listRef = useRef<HTMLDivElement>(null)
  const box = useMeasuredBox(listRef, '[aria-selected="true"]', value)

  return (
    <div
      ref={listRef}
      role="tablist"
      className="relative flex h-[3.25rem] shrink-0 items-center border-b border-line-soft"
    >
      {TABS.map((tab, index) => {
        const selected = tab.value === value
        const Icon = tab.icon
        return (
          <Fragment key={tab.value}>
            {index > 0 ? (
              <i aria-hidden="true" className="h-[0.875rem] w-[0.075rem] shrink-0 rounded-full bg-line" />
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.value)}
              className={cn(
                "flex h-full items-center gap-2 whitespace-nowrap px-[1.125rem] font-sans text-[0.9375rem] font-medium transition-colors first:pl-0",
                selected ? "text-ink" : "text-ink-quiet hover:text-ink-soft",
              )}
            >
              {selected ? <Icon aria-hidden="true" className="size-4" /> : null}
              {tab.label}
            </button>
          </Fragment>
        )
      })}
      {box ? (
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-0.5 rounded-full bg-ink transition-[transform,width] duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ width: box.width, transform: `translateX(${box.left}px)` }}
        />
      ) : null}
    </div>
  )
}
