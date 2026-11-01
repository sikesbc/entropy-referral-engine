"use client"

import { useCallback, useMemo } from "react"
import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { discoveryKeys, fetchTopTrades, fetchWalletIdentities } from "./discovery"
import { hyperliquidInfo } from "./hyperliquid"
import { useMarkets } from "./markets"
import { POLL } from "./polling"
import type { WalletIdentity } from "./types/discovery"
import {
  buildMarketMap,
  fallbackTrader,
  traderFromIdentity,
  type FeedTrader,
  type MarketMap,
} from "@/lib/feed/trade-event"
import type { PricePoint } from "@/lib/feed/sparkline"

export const TOP_TRADES_PAGE_SIZE = 20
const IDENTITY_BATCH_SIZE = 20
const MAX_CANDLES_PER_SPAN = 240
const CANDLE_RETENTION = 4900
const MIN_CANDLES_PER_WINDOW = 60

const SPARKLINE_INTERVALS: [interval: string, ms: number][] = [
  ["1m", 60_000],
  ["5m", 300_000],
  ["15m", 900_000],
  ["1h", 3_600_000],
  ["4h", 14_400_000],
  ["1d", 86_400_000],
]

const EMPTY_POINTS: PricePoint[] = []

export const socialKeys = {
  feed: (feed: string) => [...discoveryKeys.all, "top-trades-feed", feed] as const,
  sparkline: (coin: string, windowId: string, bucket: number) =>
    ["social", "sparkline", coin, windowId, bucket] as const,
}

export function useMarketMap(): MarketMap {
  const { data } = useMarkets()
  return useMemo(() => buildMarketMap(data?.markets), [data])
}

export function useTopTradeEventsFeed(feed: string, enabled = true) {
  const refetchInterval = usePollingInterval(POLL.social)
  return useInfiniteQuery({
    queryKey: socialKeys.feed(feed),
    queryFn: ({ pageParam }) => fetchTopTrades({ feed, offset: pageParam, limit: TOP_TRADES_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    refetchInterval,
    enabled,
  })
}

function identityBatches(addresses: string[]): string[][] {
  const sorted = [...new Set(addresses.map((address) => address.toLowerCase()))].sort()
  return Array.from({ length: Math.ceil(sorted.length / IDENTITY_BATCH_SIZE) }, (_, index) =>
    sorted.slice(index * IDENTITY_BATCH_SIZE, (index + 1) * IDENTITY_BATCH_SIZE),
  )
}

export function useWalletIdentityMap(addresses: string[]) {
  const batches = useMemo(() => identityBatches(addresses), [addresses])
  const { items, isPending } = useQueries({
    queries: batches.map((batch) => ({
      queryKey: discoveryKeys.identities(batch),
      queryFn: () => fetchWalletIdentities(batch),
      staleTime: 10 * 60_000,
    })),
    combine: (results) => ({
      items: results.flatMap((result) => result.data?.items ?? []),
      isPending: results.some((result) => result.isPending),
    }),
  })
  const identities = useMemo(
    () => new Map<string, WalletIdentity>(items.map((item) => [item.address.toLowerCase(), item])),
    [items],
  )
  const traderFor = useCallback(
    (address: string): FeedTrader => {
      const identity = identities.get(address.toLowerCase())
      return identity ? traderFromIdentity(identity) : fallbackTrader(address)
    },
    [identities],
  )
  return { traderFor, isPending }
}

type SparklineRequest = {
  coin: string
  windowId: string
  from: number
  to: number
  isOpen: boolean
  now: number
  enabled: boolean
}

type SparklineSeries = { start: number; end: number; points: PricePoint[] }

async function fetchSparkline({ coin, from, to, now }: SparklineRequest): Promise<SparklineSeries> {
  for (const [interval, ms] of SPARKLINE_INTERVALS) {
    if ((to - from) / ms > MAX_CANDLES_PER_SPAN) continue
    const pad = Math.max(0, MIN_CANDLES_PER_WINDOW * ms - (to - from)) / 2
    const end = Math.round(Math.min(now, to + pad))
    const start = Math.round(Math.min(from - pad, end - MIN_CANDLES_PER_WINDOW * ms))
    if (start < now - CANDLE_RETENTION * ms) continue
    const candles = await hyperliquidInfo({
      type: "candleSnapshot",
      req: { coin, interval, startTime: start, endTime: end },
    })
    if (candles.length < 2) continue
    return {
      start,
      end,
      points: candles.map((candle) => ({ time: candle.t + ms, price: Number(candle.c) })),
    }
  }
  return { start: Math.round(from), end: Math.round(to), points: [] }
}

export function useSparklineSeries(request: SparklineRequest) {
  const bucket = request.isOpen ? Math.floor(request.now / 60_000) : 0
  const query = useQuery({
    queryKey: socialKeys.sparkline(request.coin, request.windowId, bucket),
    queryFn: () => fetchSparkline(request),
    staleTime: request.isOpen ? 15_000 : Number.POSITIVE_INFINITY,
    enabled: request.enabled,
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2] === request.coin && previousQuery?.queryKey[3] === request.windowId
        ? previous
        : undefined,
  })
  return {
    points: query.data?.points ?? EMPTY_POINTS,
    isPending: query.isPending,
    isError: query.isError,
  }
}
