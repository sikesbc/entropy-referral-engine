"use client"

import { useMemo } from "react"
import { formatUsd } from "@/lib/format/money"
import { historyForRange, portfolioRangeOption, type PortfolioRange } from "@/lib/profile/portfolio-history"
import type { Portfolio } from "@/lib/api/types/hyperliquid"
import { ChangePill } from "./change-pill"
import { PortfolioChart } from "./portfolio-chart"
import { SMALL_BUTTON_CLASS } from "./profile-styles"
import { RangeTabs } from "./range-tabs"
import { RollingPrice } from "./rolling-price"

export function PortfolioValueCard({
  equity,
  equityError,
  onEquityRetry,
  portfolio,
  historyLoading,
  historyError,
  onHistoryRetry,
  range,
  onRangeChange,
  now,
}: {
  equity: number | null
  equityError: boolean
  onEquityRetry: () => void
  portfolio: Portfolio | undefined
  historyLoading: boolean
  historyError: boolean
  onHistoryRetry: () => void
  range: PortfolioRange
  onRangeChange: (range: PortfolioRange) => void
  now: number
}) {
  const option = portfolioRangeOption(range)
  const history = useMemo(() => historyForRange(portfolio, range, now), [portfolio, range, now])
  const balance = history?.balanceSeries ?? []
  const change = history && (history.pnlSeries.length > 0 || balance.length > 0) ? history.change : null
  const trendUp = (history?.change.usd ?? 0) >= 0

  return (
    <section aria-label="Portfolio value" className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-2.5 px-6 pb-1 pt-5">
        <div className="flex items-center justify-between font-sans text-[0.9375rem] font-medium text-ink-soft">
          Portfolio value
        </div>
        <div className="flex min-h-[3.25rem] items-center gap-3.5">
          <div
            className="flex items-baseline font-mono font-medium tabular-nums text-ink h-[3.625rem] text-[3.25rem] tracking-[-0.046em]"
            aria-live="off"
          >
            {equity !== null ? (
              <RollingPrice text={formatUsd(equity)} sheen />
            ) : equityError ? (
              <span className="flex items-center gap-3 font-sans text-[0.8125rem] font-normal tracking-normal text-ink-quiet">
                Couldn&apos;t load your balance.
                <button type="button" onClick={onEquityRetry} className={SMALL_BUTTON_CLASS}>
                  Try again
                </button>
              </span>
            ) : (
              <span className="text-ink-ghost">$—</span>
            )}
          </div>
          {change ? <ChangePill change={change.usd} percent={change.pct} /> : null}
          <span className="font-sans text-[0.875rem] leading-[1.125rem] text-ink-quiet">
            {option.changeLabel}
          </span>
        </div>
      </div>
      <div className="relative mt-0.5 min-h-[12rem] flex-1">
        {historyError && !historyLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[0.8125rem] text-ink-quiet">
            Could not load history.
            <button type="button" onClick={onHistoryRetry} className={SMALL_BUTTON_CLASS}>
              Try again
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 pl-5 pr-4 pt-3.5">
            <PortfolioChart
              points={balance}
              color={trendUp ? "var(--color-up)" : "var(--color-down)"}
              ready={!historyLoading}
              emptyText="No history yet"
            />
          </div>
        )}
      </div>
      <div className="flex h-10 items-center gap-1 border-t border-line-soft px-4">
        <RangeTabs value={range} onChange={onRangeChange} />
      </div>
    </section>
  )
}
