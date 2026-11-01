"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CHART_INTERVALS, type ChartInterval, type ChartRange } from "@/lib/trade/chart-ranges"

type ChartTimeframeMenuProps = {
  range: ChartRange
  interval: ChartInterval
  onIntervalChange: (interval: ChartInterval) => void
}

function isChartInterval(value: unknown): value is ChartInterval {
  return CHART_INTERVALS.some((interval) => interval === value)
}

export function ChartTimeframeMenu({ range, interval, onIntervalChange }: ChartTimeframeMenuProps) {
  const live = range === "live"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Chart timeframe"
        className="flex h-7 min-w-[3.75rem] items-center justify-between gap-1 rounded-[0.375rem] bg-panel-2 px-2 font-sans text-[0.8125rem] font-medium text-ink transition-colors hover:bg-panel-3 outline-none focus:outline-none focus-visible:outline-none focus-visible:bg-panel-3 data-[popup-open]:bg-panel-3"
      >
        {live ? "Live" : interval}
        <ChevronDown className="size-3 text-ink-quiet" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={6}
        className="entropy-trade-scope min-w-[7.5rem] rounded-[0.5rem] border border-line-soft bg-panel p-1.5 text-ink shadow-xl ring-0"
      >
        <DropdownMenuRadioGroup
          value={live ? null : interval}
          onValueChange={(value) => {
            if (isChartInterval(value)) onIntervalChange(value)
          }}
        >
          {CHART_INTERVALS.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              className="rounded-[0.375rem] py-1.5 pl-2 font-sans text-[0.8125rem] text-ink-soft focus:bg-ink/6 focus:text-ink data-[checked]:bg-ink/6 data-[checked]:text-ink dark:focus:bg-ink/12 dark:data-[checked]:bg-ink/12"
            >
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
