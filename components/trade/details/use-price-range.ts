"use client"

import { useMemo } from "react"
import { useCandles } from "@/lib/api/hyperliquid"
import type { CandleInterval } from "@/lib/api/types/hyperliquid"

export type PriceRange = { high: number; low: number } | null

export function usePriceRange(
  coin: string,
  interval: CandleInterval,
  startTime: number,
  endTime: number,
): PriceRange {
  const candles = useCandles(coin, interval, { startTime, endTime })
  return useMemo(() => {
    const inRange = (candles.data ?? []).filter((candle) => candle.T >= startTime)
    if (inRange.length === 0) return null
    return {
      high: Math.max(...inRange.map((candle) => Number(candle.h))),
      low: Math.min(...inRange.map((candle) => Number(candle.l))),
    }
  }, [candles.data, startTime])
}
