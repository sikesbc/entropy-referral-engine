"use client"

import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { hyperliquidInfo, hyperliquidKeys } from "@/lib/api/hyperliquid"
import { useMarkets } from "@/lib/api/markets"
import { POLL } from "@/lib/api/polling"
import type { MetaAndAssetCtxs } from "@/lib/api/types/hyperliquid"
import type { Market } from "@/lib/api/types/markets"
import { usePollingInterval } from "@/lib/runtime/runtime-context"

export type SearchMarketRow = {
  market: Market
  price: number | null
  change: number | null
  volume: number | null
  openInterest: number | null
}

type AssetStats = { price: number; prev: number; volume: number; openInterest: number }

const STARTUPS_CATEGORY = "Startups"
const PRE_IPO_CATEGORY = "Pre-IPOs"

function dexKey(dex: string): string {
  return dex && dex !== "default" ? dex : ""
}

function statsByName(data: MetaAndAssetCtxs | undefined): Map<string, AssetStats> {
  const stats = new Map<string, AssetStats>()
  if (!Array.isArray(data) || !data[0]?.universe) return stats
  const [meta, contexts] = data
  meta.universe.forEach((asset, index) => {
    const context = contexts[index]
    if (!context) return
    const mark = parseFloat(context.markPx)
    const mid = context.midPx === null ? NaN : parseFloat(context.midPx)
    const openInterest = parseFloat(context.openInterest)
    stats.set(asset.name, {
      price: Number.isFinite(mid) && mid > 0 ? mid : mark,
      prev: parseFloat(context.prevDayPx),
      volume: parseFloat(context.dayNtlVlm),
      openInterest: Number.isFinite(openInterest) && Number.isFinite(mark) ? openInterest * mark : 0,
    })
  })
  return stats
}

type MetaQuery = { data: MetaAndAssetCtxs | undefined; isPending: boolean }

function combineMetas(results: MetaQuery[]) {
  return { data: results.map((result) => result.data), pending: results.some((result) => result.isPending) }
}

export function useSearchMarketRows() {
  const markets = useMarkets()
  const refetchInterval = usePollingInterval(POLL.markets)
  const list = useMemo(() => markets.data?.markets ?? [], [markets.data])
  const dexes = useMemo(() => [...new Set(list.map((market) => dexKey(market.dex)))], [list])

  const metas = useQueries({
    queries: dexes.map((dex) => {
      const request = { type: "metaAndAssetCtxs" as const, dex }
      return {
        queryKey: hyperliquidKeys.info(request),
        queryFn: () => hyperliquidInfo(request),
        refetchInterval,
      }
    }),
    combine: combineMetas,
  })

  const rows = useMemo(() => {
    const maps = metas.data.map(statsByName)
    const result: SearchMarketRow[] = []
    for (const market of list) {
      if (market.isDelisted) continue
      const stats = maps.find((map) => map.has(market.name))?.get(market.name)
      const price = stats && stats.price > 0 ? stats.price : null
      result.push({
        market: market.category === PRE_IPO_CATEGORY ? { ...market, category: STARTUPS_CATEGORY } : market,
        price,
        change: price !== null && stats && stats.prev > 0 ? (price - stats.prev) / stats.prev : null,
        volume: stats?.volume ?? null,
        openInterest: stats?.openInterest ?? null,
      })
    }
    return result
  }, [list, metas.data])

  return { rows, isLoading: markets.isPending || metas.pending }
}
