"use client"

import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { hyperliquidInfo, hyperliquidKeys } from "@/lib/api/hyperliquid"
import { POLL } from "@/lib/api/polling"
import type { MetaAndAssetCtxs } from "@/lib/api/types/hyperliquid"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { infoDex, type AssetCtxMap } from "./markets"

function combine(results: { data?: MetaAndAssetCtxs }[]): AssetCtxMap {
  const map: AssetCtxMap = new Map()
  for (const { data } of results) {
    if (!data) continue
    const [meta, contexts] = data
    meta.universe.forEach((asset, index) => {
      const context = contexts[index]
      if (context) map.set(asset.name, context)
    })
  }
  return map
}

export function useAssetContexts(dexes: string[]): AssetCtxMap {
  const refetchInterval = usePollingInterval(POLL.markets)
  const requests = useMemo(
    () => [...new Set(dexes.map(infoDex))].map((dex) => ({ type: "metaAndAssetCtxs" as const, dex })),
    [dexes],
  )
  return useQueries({
    queries: requests.map((request) => ({
      queryKey: hyperliquidKeys.info(request),
      queryFn: () => hyperliquidInfo(request),
      refetchInterval,
    })),
    combine,
  })
}
