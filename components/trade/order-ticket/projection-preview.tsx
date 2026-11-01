"use client"

import type { OrderSide } from "@/lib/api/types/orders"
import { cn } from "@/lib/utils"
import { MOVE_PRESETS, sanitizeDecimal } from "./ticket-math"

type ProjectionPreviewProps = {
  side: OrderSide
  movePercent: number
  profit: number
  preset: number | null
  custom: string
  onPresetChange: (preset: number) => void
  onCustomChange: (custom: string) => void
  autoClose: string
}

const usdStandard = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  notation: "compact",
})

function formatProfit(profit: number): string {
  if (profit <= 0) return usdStandard.format(0)
  return `+${(profit >= 1e6 ? usdCompact : usdStandard).format(profit)}`
}

function formatMove(movePercent: number): string {
  return String(Number(movePercent.toFixed(2)))
}

export function ProjectionPreview({
  side,
  movePercent,
  profit,
  preset,
  custom,
  onPresetChange,
  onCustomChange,
  autoClose,
}: ProjectionPreviewProps) {
  return (
    <dl
      data-tour="preview"
      className="flex flex-col gap-1.5 rounded-[0.5rem] bg-panel-2 px-3 py-2.5 dark:bg-panel-3"
    >
      <div className="mb-1 flex flex-col gap-1.5 border-b border-ink/10 pb-2.5">
        <dt className="text-[0.75rem] text-ink-quiet">
          If price {side === "long" ? "rises" : "falls"} {formatMove(movePercent)}%
        </dt>
        <dd>
          <span
            className={cn(
              "inline-block py-[0.375rem] font-mono text-[1.75rem] font-semibold leading-none tabular-nums tracking-[-0.04em]",
              profit > 0 ? "text-up" : "text-ink-ghost",
            )}
          >
            {formatProfit(profit)}
          </span>
        </dd>
        <dd className="grid grid-cols-4 gap-1 pt-1">
          {MOVE_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={preset === value}
              onClick={() => onPresetChange(value)}
              className={cn(
                "lite-raised-chip h-7 rounded-[0.5rem] font-mono text-[0.8125rem] font-semibold",
                preset === value ? "text-ink" : "text-ink-soft",
              )}
            >
              {value}%
            </button>
          ))}
          <div className="relative">
            <input
              aria-label="Custom price move in percent"
              inputMode="decimal"
              placeholder="Custom"
              autoComplete="off"
              value={custom}
              onChange={(event) => onCustomChange(sanitizeDecimal(event.target.value))}
              className={cn(
                "h-7 w-full rounded-[0.5rem] bg-panel text-center font-mono text-[0.8125rem] font-semibold text-ink outline-none ring-1 ring-inset placeholder:font-sans placeholder:font-medium placeholder:text-ink-quiet",
                custom ? "pl-2 pr-5" : "px-2",
                preset === null ? "ring-line" : "ring-line-soft",
              )}
            />
            {custom ? (
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[0.8125rem] font-semibold text-ink-quiet">
                %
              </span>
            ) : null}
          </div>
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4 text-[0.75rem]">
        <dt className="text-ink-quiet">Est. auto-close</dt>
        <dd className="text-right font-mono tabular-nums tracking-[-0.04em] text-ink">{autoClose}</dd>
      </div>
    </dl>
  )
}
