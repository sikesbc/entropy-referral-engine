"use client"

import { useMemo, useState } from "react"
import Big from "big.js"
import { RollingPrice } from "@/components/ui/rolling-price"
import { Skeleton } from "@/components/ui/skeleton"
import { absDecimal, formatExactUsd, formatUsd } from "@/lib/referral-site/format"
import type { DecimalString, EarningsSeriesRange, EarningsSeriesResponse } from "@/lib/referral-site/types"
import { EarningsChange } from "./earnings-change"
import { EarningsChart } from "./earnings-chart"
import { EARNINGS_RANGES, type EarningsPoint, type EarningsRange } from "./earnings-range"
import { EarningsRangeTabs } from "./earnings-range-tabs"
import { formatLongDate } from "./referral-format"
import { SMALL_BUTTON_CLASS } from "./referral-styles"

export const SERIES_RANGES: Record<EarningsRange, EarningsSeriesRange> = {
  week: "1W",
  month: "1M",
  all: "ALL",
}

type SeriesPoint = EarningsPoint & { exact: DecimalString }

function toPoints(series: EarningsSeriesResponse): SeriesPoint[] {
  return series.points.map((point) => ({
    time: Date.parse(point.time),
    value: Number(point.earnedUsd),
    exact: point.earnedUsd,
  }))
}

export function SiteEarningsPanel({
  series,
  range,
  onRangeChange,
  isError,
  onRetry,
}: {
  series: EarningsSeriesResponse | undefined
  range: EarningsRange
  onRangeChange: (range: EarningsRange) => void
  isError: boolean
  onRetry: () => void
}) {
  const [scrubbedTime, setScrubbedTime] = useState<number | null>(null)
  const option = EARNINGS_RANGES.find((entry) => entry.value === range) ?? EARNINGS_RANGES[1]
  const points = useMemo(() => (series ? toPoints(series) : []), [series])
  const scrubbed =
    scrubbedTime === null ? null : (points.find((point) => point.time === scrubbedTime) ?? null)

  const shown = scrubbed?.exact ?? series?.totalEarnedUsd ?? null
  const first = points[0]?.exact ?? null
  const change =
    series && first !== null && points.length > 1
      ? scrubbed
        ? new Big(scrubbed.exact).minus(first).toFixed()
        : series.rangeEarnedUsd
      : null

  const selectRange = (next: EarningsRange) => {
    setScrubbedTime(null)
    onRangeChange(next)
  }

  return (
    <section aria-label="Referral earnings" className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-2.5 px-6 pb-1 pt-5">
        <h1 className="flex h-[1.625rem] items-center whitespace-nowrap font-sans text-[0.9375rem] font-medium text-ink-soft">
          Total earned
        </h1>
        <div className="flex min-h-[3.25rem] flex-wrap items-center gap-x-3.5 gap-y-2">
          <div
            className="flex items-baseline font-mono font-medium tabular-nums text-ink h-[3.625rem] text-[3.25rem] tracking-[-0.046em]"
            aria-live="off"
          >
            {shown !== null ? (
              <span title={formatExactUsd(shown)}>
                <RollingPrice text={formatUsd(shown)} />
              </span>
            ) : isError ? (
              <span className="flex items-center gap-3 font-sans text-[0.8125rem] font-normal tracking-normal text-ink-quiet">
                Couldn’t load your earnings.
                <button type="button" onClick={onRetry} className={SMALL_BUTTON_CLASS}>
                  Try again
                </button>
              </span>
            ) : (
              <Skeleton className="h-[2.6rem] w-[11rem] rounded-[0.375rem]" />
            )}
          </div>
          {change !== null ? (
            <EarningsChange
              change={Number(change)}
              label={formatUsd(absDecimal(change))}
              title={formatExactUsd(absDecimal(change))}
            />
          ) : null}
          {shown !== null ? (
            <span className="font-sans text-[0.875rem] leading-[1.125rem] text-ink-quiet">
              {scrubbed ? (
                <>
                  by <b className="font-normal text-ink-soft">{formatLongDate(scrubbed.time)}</b>
                </>
              ) : (
                option.caption
              )}
            </span>
          ) : null}
        </div>
      </div>
      <div className="relative mt-0.5 min-h-[12rem] flex-1">
        {isError && !series ? null : (
          <div className="absolute inset-0 pl-5 pr-4 pt-3.5">
            <EarningsChart
              points={points}
              emptyText={series ? "No earnings yet" : "Loading…"}
              onScrub={(point) => setScrubbedTime(point?.time ?? null)}
            />
          </div>
        )}
      </div>
      <div className="flex h-10 items-center gap-1 border-t border-line-soft px-4">
        <EarningsRangeTabs value={range} onChange={selectRange} />
      </div>
    </section>
  )
}
