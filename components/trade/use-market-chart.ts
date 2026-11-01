"use client"

import { useMemo, useState } from "react"
import { useCandles } from "@/lib/api/hyperliquid"
import { useLiveTicks, useMarkets } from "@/lib/api/markets"
import type { Market } from "@/lib/api/types/markets"
import { useNow } from "@/lib/runtime/runtime-context"
import {
  candleWindow,
  DEFAULT_RANGE_INTERVAL,
  INTERVAL_MS,
  type ChartInterval,
  type ChartRange,
  type ChartType,
} from "@/lib/trade/chart-ranges"
import { candleSeries, liveSeries, seriesChange } from "@/lib/trade/chart-series"
import { rankMarkets } from "@/lib/trade/markets"
import { priceDecimals } from "@/lib/trade/price"
import { useAssetContexts } from "@/lib/trade/use-asset-contexts"

const NO_DEXES: string[] = []
const NO_MARKETS: Market[] = []
const LIVE_TICK_MS = 1000
const CANDLE_TICK_MS = 60_000
const FALLBACK_SZ_DECIMALS = 2

export function useMarketChart(coin: string) {
  const [range, setRange] = useState<ChartRange>("live")
  const [interval, setChartInterval] = useState<ChartInterval>(DEFAULT_RANGE_INTERVAL["1D"])
  const [chartType, setChartType] = useState<ChartType>("line")
  const live = range === "live"

  const { data: marketsData } = useMarkets()
  const markets = marketsData?.markets ?? NO_MARKETS
  const contexts = useAssetContexts(marketsData?.dexes ?? NO_DEXES)
  const rankedMarkets = useMemo(() => rankMarkets(markets, contexts), [markets, contexts])
  const market = markets.find((candidate) => candidate.name === coin) ?? null
  const context = contexts.get(coin)

  const now = useNow(live ? LIVE_TICK_MS : CANDLE_TICK_MS)
  const ticks = useLiveTicks(coin).data
  const span = candleWindow(live ? "1D" : range, interval, now)
  const candles = useCandles(live ? "" : coin, interval, span).data

  const series = live
    ? liveSeries(ticks ?? [], now)
    : candleSeries(candles ?? [], span.startTime, span.endTime)
  const lastTick = ticks?.at(-1)
  const contextPrice = context ? Number(context.midPx ?? context.markPx) : null
  const price = lastTick ? lastTick[1] : contextPrice
  const decimals = priceDecimals(price ?? 0, market?.szDecimals ?? FALLBACK_SZ_DECIMALS)
  const change = seriesChange(series, price)

  const changeRange = (next: ChartRange) => {
    setRange(next)
    if (next === "live") setChartType("line")
    else setChartInterval(DEFAULT_RANGE_INTERVAL[next])
  }

  const changeInterval = (next: ChartInterval) => {
    if (live) setRange("1D")
    setChartInterval(next)
  }

  return {
    market,
    rankedMarkets,
    price,
    decimals,
    change,
    series,
    range,
    interval,
    intervalMs: INTERVAL_MS[interval],
    chartType,
    changeRange,
    changeInterval,
    setChartType,
  }
}
