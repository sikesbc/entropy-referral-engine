"use client"

import { useRef } from "react"
import { SlidingHighlight } from "@/components/ui/sliding-highlight"
import { useMeasuredBox } from "@/hooks/use-measured-box"
import { cn } from "@/lib/utils"

export type SegmentOption<T extends string> = { value: T; label: string }

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const box = useMeasuredBox(ref, "[data-segment-active]", value)

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 shrink-0 items-center rounded-full bg-panel-2 p-[0.1875rem]",
        className,
      )}
    >
      <SlidingHighlight
        box={box}
        className="rounded-full bg-panel shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.12)] dark:bg-[#2a2a2a] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_2px_6px_rgba(0,0,0,0.35)]"
      />
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            data-segment-active={active ? "" : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-[1] inline-flex h-[1.875rem] items-center justify-center whitespace-nowrap rounded-full px-4 font-sans text-[0.875rem] font-medium transition-colors duration-[250ms]",
              active ? "text-ink" : "text-ink-quiet hover:text-ink-soft",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
