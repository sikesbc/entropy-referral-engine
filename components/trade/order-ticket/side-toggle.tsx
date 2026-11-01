"use client"

import type { OrderSide } from "@/lib/api/types/orders"
import { cn } from "@/lib/utils"

const SIDES: { value: OrderSide; label: string; activeClass: string }[] = [
  { value: "long", label: "Long", activeClass: "bg-up-bg text-up" },
  { value: "short", label: "Short", activeClass: "bg-down-bg text-down" },
]

export function SideToggle({ side, onChange }: { side: OrderSide; onChange: (side: OrderSide) => void }) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-[0.5rem] bg-panel-2 p-1 dark:bg-panel-3"
      role="radiogroup"
      aria-label="Side"
      data-tour="side"
    >
      {SIDES.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={side === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[0.375rem] py-1.5 text-[0.8125rem] font-medium transition-colors",
            side === option.value ? option.activeClass : "text-ink-quiet",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
