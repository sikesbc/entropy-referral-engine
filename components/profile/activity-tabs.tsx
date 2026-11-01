"use client"

import { Fragment, useRef, type ReactNode } from "react"
import { useMeasuredBox } from "@/hooks/use-measured-box"
import { cn } from "@/lib/utils"

export type ActivityTab<T extends string> = {
  value: T
  label: string
  icon: ReactNode
  count?: number
}

export function ActivityTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: ActivityTab<T>[]
  value: T
  onChange: (value: T) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const counts = tabs.map((tab) => tab.count ?? "").join("|")
  const box = useMeasuredBox(ref, '[aria-selected="true"]', `${value}|${counts}`)

  return (
    <div
      ref={ref}
      role="tablist"
      className="relative flex h-[3.25rem] shrink-0 items-center border-b border-line-soft"
    >
      {tabs.map((tab, index) => {
        const selected = tab.value === value
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
              {selected ? tab.icon : null}
              {tab.label}
              {tab.count ? (
                <em
                  className={cn(
                    "ml-0.5 inline-flex h-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-full px-[0.4375rem] font-mono text-[0.75rem] not-italic tabular-nums transition-colors",
                    selected ? "bg-ink/15 text-ink" : "bg-panel-3 text-ink-soft dark:bg-ink/10",
                  )}
                >
                  {tab.count}
                </em>
              ) : null}
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
