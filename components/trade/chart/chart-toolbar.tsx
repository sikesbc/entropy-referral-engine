"use client"

import { ChartCandlestick, ChartNoAxesCombined } from "lucide-react"
import { CHART_RANGES, type ChartInterval, type ChartRange, type ChartType } from "@/lib/trade/chart-ranges"
import { cn } from "@/lib/utils"
import { ChartTimeframeMenu } from "./chart-timeframe-menu"

type ChartToolbarProps = {
  range: ChartRange
  interval: ChartInterval
  chartType: ChartType
  onRangeChange: (range: ChartRange) => void
  onIntervalChange: (interval: ChartInterval) => void
  onChartTypeChange: (type: ChartType) => void
}

const RANGE_TAB_CLASS =
  "inline-grid px-1 py-1 font-sans text-[0.8125rem] transition-colors after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)]"

const TYPE_BUTTON_CLASS =
  "rounded-[0.25rem] px-2 py-[0.1875rem] text-[0.6875rem] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40"

const CHART_TYPES = [
  { id: "line", label: "Line chart", Icon: ChartNoAxesCombined },
  { id: "candle", label: "Candlestick chart", Icon: ChartCandlestick },
] as const

export function ChartToolbar({
  range,
  interval,
  chartType,
  onRangeChange,
  onIntervalChange,
  onChartTypeChange,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between border-t border-line-soft py-1.5 pl-1.5 pr-3">
      <div className="flex min-w-0 items-center gap-1">
        <ChartTimeframeMenu range={range} interval={interval} onIntervalChange={onIntervalChange} />
        <div className="flex items-center gap-1 sm:gap-3 px-1" role="tablist" aria-label="Chart range">
          {CHART_RANGES.map((option) => {
            const selected = option.id === range
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={selected}
                data-label={option.label}
                onClick={() => onRangeChange(option.id)}
                className={cn(
                  RANGE_TAB_CLASS,
                  selected ? "font-semibold text-ink" : "font-medium text-ink-quiet hover:text-ink",
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
      <div
        className="flex shrink-0 items-center gap-0.5 rounded-[0.375rem] bg-panel-2 p-0.5"
        role="group"
        aria-label="Chart type"
      >
        {CHART_TYPES.map(({ id, label, Icon }) => {
          const pressed = id === chartType
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={pressed}
              disabled={id === "candle" && range === "live"}
              onClick={() => onChartTypeChange(id)}
              className={cn(
                TYPE_BUTTON_CLASS,
                pressed ? "bg-panel-3 text-ink" : "text-ink-quiet hover:text-ink",
              )}
            >
              <Icon size="1rem" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
