"use client"

import { useMemo } from "react"
import { useMarkets } from "@/lib/api/markets"
import { coinTicker } from "@/lib/trade/market-snapshot"

export type MarketInfo = { name: string; ticker: string; szDecimals: number }

export type MarketDirectory = { lookup: (coin: string) => MarketInfo }

export function useMarketDirectory(): MarketDirectory {
  const markets = useMarkets()
  return useMemo(() => {
    const byName = new Map((markets.data?.markets ?? []).map((market) => [market.name, market]))
    return {
      lookup: (coin: string) => {
        const market = byName.get(coin)
        return {
          name: market?.displayName ?? coinTicker(coin),
          ticker: coinTicker(coin),
          szDecimals: market?.szDecimals ?? 2,
        }
      },
    }
  }, [markets.data])
}
