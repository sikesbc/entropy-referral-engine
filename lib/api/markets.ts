"use client"

import { useQuery } from "@tanstack/react-query"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { apiGet } from "./client"
import { POLL } from "./polling"
import type {
  LiveTicksResponse,
  MarketHighlightsResponse,
  MarketsResponse,
  MobileListingsResponse,
} from "./types/markets"

export const marketsKeys = {
  all: ["markets"] as const,
  list: () => [...marketsKeys.all, "list"] as const,
  highlights: () => [...marketsKeys.all, "highlights"] as const,
  liveTicks: (coin: string) => [...marketsKeys.all, "live-ticks", coin] as const,
  mobileListings: () => [...marketsKeys.all, "mobile-listings"] as const,
}

export const fetchMarkets = () => apiGet<MarketsResponse>("/api/markets")
export const fetchMarketHighlights = () => apiGet<MarketHighlightsResponse>("/api/markets/highlights")
export const fetchLiveTicks = (coin: string) => apiGet<LiveTicksResponse>("/api/markets/live-ticks", { coin })
export const fetchMobileListings = () => apiGet<MobileListingsResponse>("/api/markets/mobile-listings")

export function useMarkets() {
  return useQuery({ queryKey: marketsKeys.list(), queryFn: fetchMarkets, staleTime: 5 * 60_000 })
}

export function useMarketHighlights() {
  const refetchInterval = usePollingInterval(POLL.markets)
  return useQuery({ queryKey: marketsKeys.highlights(), queryFn: fetchMarketHighlights, refetchInterval })
}

export function useLiveTicks(coin: string) {
  const refetchInterval = usePollingInterval(POLL.ticks)
  return useQuery({
    queryKey: marketsKeys.liveTicks(coin),
    queryFn: () => fetchLiveTicks(coin),
    refetchInterval,
    enabled: coin.length > 0,
  })
}

export function useMobileListings() {
  return useQuery({
    queryKey: marketsKeys.mobileListings(),
    queryFn: fetchMobileListings,
    staleTime: 5 * 60_000,
  })
}
