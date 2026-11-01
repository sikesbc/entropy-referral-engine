"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { OrderType } from "@/lib/api/types/orders"
import { cn } from "@/lib/utils"

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: "market", label: "Market" },
  { value: "limit", label: "Limit" },
]

export function OrderTypeMenu({
  value,
  onChange,
}: {
  value: OrderType
  onChange: (value: OrderType) => void
}) {
  const current = ORDER_TYPES.find((option) => option.value === value) ?? ORDER_TYPES[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Order type"
        className="group -mr-2 flex h-7 items-center gap-1 rounded-[0.375rem] px-2 font-sans text-[0.8125rem] font-medium text-ink transition-colors hover:bg-panel-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)] data-[popup-open]:bg-panel-2"
      >
        <span>{current.label}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-3 text-ink-quiet transition-transform duration-150 group-data-[popup-open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="entropy-trade-scope w-[10.5rem] min-w-[10.5rem] rounded-[0.5rem] border border-line-soft bg-panel p-1.5 text-ink shadow-xl ring-0"
      >
        {ORDER_TYPES.map((option) => (
          <DropdownMenuItem
            key={option.value}
            role="menuitemradio"
            aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex w-full items-center rounded-[0.375rem] px-2 py-1.5 text-left font-sans text-[0.8125rem] transition-colors duration-150 focus:bg-ink/6 focus:text-ink dark:focus:bg-ink/12",
              option.value === value ? "bg-ink/6 text-ink dark:bg-ink/12" : "text-ink-soft",
            )}
          >
            <span className="relative z-10">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
