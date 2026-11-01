"use client"

import { formatCompactUsd } from "@/lib/format/money"
import { formatSignedPercent } from "@/lib/format/percent"
import { formatMarketPrice } from "@/lib/format/price"
import { useNow } from "@/lib/runtime/runtime-context"
import type { MarketSnapshot } from "@/lib/trade/market-snapshot"
import { MarketStat, type MarketStatTone } from "./market-stat"
import { usePriceRange } from "./use-price-range"

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS
const MONTH_MS = 30 * DAY_MS
const EMPTY = "—"

type Stat = { label: string; value: string; tone?: MarketStatTone }

export function AboutPanel({ market }: { market: MarketSnapshot }) {
  const now = Math.floor(useNow(MINUTE_MS) / MINUTE_MS) * MINUTE_MS
  const day = usePriceRange(market.coin, "1h", now - DAY_MS, now)
  const month = usePriceRange(market.coin, "1d", now - MONTH_MS, now)
  const { ctx, markPx, szDecimals } = market

  const prevDayPx = ctx ? Number(ctx.prevDayPx) : 0
  const change = markPx !== null && prevDayPx > 0 ? (markPx - prevDayPx) / prevDayPx : null
  const price = (value: number | undefined) =>
    value === undefined ? EMPTY : formatMarketPrice(value, szDecimals)

  const stats: Stat[] = [
    { label: "24h volume", value: ctx ? formatCompactUsd(Number(ctx.dayNtlVlm)) : EMPTY },
    {
      label: "Open positions",
      value: ctx && markPx !== null ? formatCompactUsd(Number(ctx.openInterest) * markPx) : EMPTY,
    },
    {
      label: "24h change",
      value: change === null ? EMPTY : formatSignedPercent(change),
      tone: change === null || change === 0 ? "neutral" : change > 0 ? "up" : "down",
    },
    { label: "Max leverage", value: market.maxLeverage === null ? EMPTY : `${market.maxLeverage}×` },
    { label: "24h high", value: price(day?.high) },
    { label: "24h low", value: price(day?.low) },
    { label: "Month high", value: price(month?.high) },
    { label: "Month low", value: price(month?.low) },
  ]

  return (
    <div>
      <div className="flex flex-col gap-4 py-3">
        {market.description ? (
          <p className="text-[0.8125rem] leading-[1.6] text-ink-quiet">{market.description}</p>
        ) : null}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <MarketStat key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
          ))}
        </dl>
      </div>
    </div>
  )
}
