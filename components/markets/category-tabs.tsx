"use client"

import {
  Bitcoin,
  Building2,
  Coins,
  DollarSign,
  Gem,
  LayoutGrid,
  Percent,
  Rocket,
  type LucideIcon,
} from "lucide-react"
import { useRef } from "react"
import { SlidingHighlight } from "@/components/ui/sliding-highlight"
import { useMeasuredBox } from "@/hooks/use-measured-box"
import type { MarketCategory } from "@/lib/markets/market-rows"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: Record<MarketCategory | "All", LucideIcon> = {
  All: LayoutGrid,
  Crypto: Bitcoin,
  Stocks: Building2,
  Startups: Rocket,
  "Indices / ETFs": Coins,
  Commodities: Gem,
  FX: DollarSign,
  Rates: Percent,
}

export function CategoryTabs({
  categories,
  value,
  onChange,
}: {
  categories: MarketCategory[]
  value: MarketCategory | null
  onChange: (category: MarketCategory | null) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const box = useMeasuredBox(ref, '[role="tab"][aria-selected="true"]', value)
  const options: (MarketCategory | null)[] = [null, ...categories]

  return (
    <div ref={ref} role="tablist" aria-label="Category" className="relative flex flex-wrap gap-1.5">
      <SlidingHighlight box={box} className="rounded-full bg-ink" />
      {options.map((category) => {
        const active = category === value
        const Icon = CATEGORY_ICONS[category ?? "All"]
        return (
          <button
            key={category ?? "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(category)}
            className={cn(
              "relative z-[1] inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[0.8125rem] font-semibold transition-colors duration-[250ms]",
              active ? "text-bg" : "lite-raised-chip text-ink-soft hover:text-ink",
            )}
          >
            <Icon size="0.875rem" aria-hidden="true" />
            {category ?? "All"}
          </button>
        )
      })}
    </div>
  )
}
