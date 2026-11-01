"use client"

import { useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReferralEarningsBucket } from "@/lib/api/types/referrals"
import { formatUsd } from "@/lib/format/money"
import { useNow } from "@/lib/runtime/runtime-context"
import { EarningsChange } from "./earnings-change"
import { EarningsChart } from "./earnings-chart"
import {
  DEFAULT_EARNINGS_RANGE,
  EARNINGS_RANGES,
  type EarningsPoint,
  type EarningsRange,
} from "./earnings-range"
import { EarningsRangeTabs } from "./earnings-range-tabs"
import { formatLongDate } from "./referral-format"
import { SMALL_BUTTON_CLASS } from "./referral-styles"
import { RollingPrice } from "@/components/ui/rolling-price"

function toPoints(history: ReferralEarningsBucket[], since: number): EarningsPoint[] {
  return history
    .map((bucket) => ({ time: Date.parse(bucket.bucket), value: bucket.earnings + (bucket.cashback ?? 0) }))
    .filter((point) => Number.isFinite(point.time) && point.time >= since)
    .sort((a, b) => a.time - b.time)
}

export function EarningsPanel({
  lifetime,
  history,
  isError,
  onRetry,
}: {
  lifetime: number | null
  history: ReferralEarningsBucket[] | null
  isError: boolean
  onRetry: () => void
}) {
  const now = useNow(60_000)
  const [range, setRange] = useState<EarningsRange>(DEFAULT_EARNINGS_RANGE)
  const [scrubbed, setScrubbed] = useState<EarningsPoint | null>(null)
  const option = EARNINGS_RANGES.find((entry) => entry.value === range) ?? EARNINGS_RANGES[1]

  const points = useMemo(
    () =>
      history ? toPoints(history, option.lookbackMs === null ? -Infinity : now - option.lookbackMs) : [],
    [history, option.lookbackMs, now],
  )

  const first = points[0]?.value ?? null
  const last = points[points.length - 1]?.value ?? lifetime
  const shown = scrubbed?.value ?? lifetime
  const change = first !== null && points.length > 1 ? (scrubbed?.value ?? last ?? first) - first : null

  const selectRange = (next: EarningsRange) => {
    setScrubbed(null)
    setRange(next)
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
              <RollingPrice text={formatUsd(shown)} />
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
          {change !== null ? <EarningsChange change={change} /> : null}
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
        {isError && !history ? null : (
          <div className="absolute inset-0 pl-5 pr-4 pt-3.5">
            <EarningsChart
              points={points}
              emptyText={history ? "No earnings yet" : "Loading…"}
              onScrub={setScrubbed}
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
