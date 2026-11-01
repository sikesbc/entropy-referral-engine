"use client"

import { useMemo } from "react"
import { useCandles } from "@/lib/api/hyperliquid"
import { useNow } from "@/lib/runtime/runtime-context"
import { candlePoints, windowPoints } from "./sparkline"

const DAY_MS = 86_400_000
const INTERVAL = "15m"
const INTERVAL_MS = 900_000
const MINUTE_MS = 60_000

export function useDaySparkline(coin: string, endPrice: number | null) {
  const now = useNow(MINUTE_MS)
  const to = now
  const from = to - DAY_MS
  const candles = useCandles(coin, INTERVAL, { startTime: from, endTime: to })
  const points = useMemo(
    () => windowPoints(candlePoints(candles.data ?? [], INTERVAL_MS), from, to, endPrice),
    [candles.data, from, to, endPrice],
  )
  return { points, isPending: candles.isPending }
}
