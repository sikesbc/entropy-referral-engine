"use client"

import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { hyperliquidInfo, hyperliquidKeys } from "@/lib/api/hyperliquid"
import { useMarkets } from "@/lib/api/markets"
import { POLL } from "@/lib/api/polling"
import type { MetaAndAssetCtxs } from "@/lib/api/types/hyperliquid"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { buildMarketRows, marketDexes, parseAssetCtxs, type MarketStats } from "./market-rows"

export function useMarketRows() {
  const markets = useMarkets()
  const list = useMemo(() => markets.data?.markets ?? [], [markets.data])
  const dexes = useMemo(() => marketDexes(list), [list])
  const refetchInterval = usePollingInterval(POLL.markets)

  const contexts = useQueries({
    queries: dexes.map((dex) => {
      const request = { type: "metaAndAssetCtxs" as const, dex }
      return {
        queryKey: hyperliquidKeys.info(request),
        queryFn: () => hyperliquidInfo(request),
        refetchInterval,
      }
    }),
    combine: (results) => ({
      data: results.map((result) => result.data as MetaAndAssetCtxs | undefined),
      isPending: results.some((result) => result.isPending),
    }),
  })

  const stats = useMemo(() => {
    const merged = new Map<string, MarketStats>()
    for (const data of contexts.data) {
      for (const [name, entry] of parseAssetCtxs(data)) merged.set(name, entry)
    }
    return merged
  }, [contexts.data])

  const rows = useMemo(() => buildMarketRows(list, stats), [list, stats])

  return { rows, isLoading: markets.isPending || contexts.isPending }
}
