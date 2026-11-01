"use client"

import { useQuery } from "@tanstack/react-query"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { apiGet } from "./client"
import { POLL } from "./polling"
import type {
  PopularLeadersResponse,
  SmartMoneyResponse,
  TopTradersParams,
  TopTradersResponse,
  TopTradesParams,
  TopTradesResponse,
  WalletIdentitiesResponse,
} from "./types/discovery"

export const discoveryKeys = {
  all: ["discovery"] as const,
  smartMoney: () => [...discoveryKeys.all, "smart-money"] as const,
  topTraders: (params: TopTradersParams) => [...discoveryKeys.all, "top-traders", params] as const,
  topTrades: (params: TopTradesParams) => [...discoveryKeys.all, "top-trades", params] as const,
  popularLeaders: () => ["copytrade", "leaders", "popular"] as const,
  identities: (addresses: string[]) => ["wallet-profiles", "identities", addresses] as const,
}

export const fetchSmartMoney = () => apiGet<SmartMoneyResponse>("/api/discovery/smart-money")
export const fetchTopTraders = (params: TopTradersParams) =>
  apiGet<TopTradersResponse>("/api/discovery/top-traders", { ...params })
export const fetchTopTrades = (params: TopTradesParams) =>
  apiGet<TopTradesResponse>("/api/discovery/top-trades", { ...params })
export const fetchPopularLeaders = () => apiGet<PopularLeadersResponse>("/api/copytrade/leaders/popular")
export const fetchWalletIdentities = (addresses: string[]) =>
  apiGet<WalletIdentitiesResponse>("/api/wallet-profiles/identities", {
    namespace: "hyperliquid-mainnet",
    addresses: addresses.join(","),
  })

export function useSmartMoney() {
  const refetchInterval = usePollingInterval(POLL.social)
  return useQuery({ queryKey: discoveryKeys.smartMoney(), queryFn: fetchSmartMoney, refetchInterval })
}

export function useTopTraders(params: TopTradersParams) {
  const refetchInterval = usePollingInterval(POLL.social)
  return useQuery({
    queryKey: discoveryKeys.topTraders(params),
    queryFn: () => fetchTopTraders(params),
    refetchInterval,
  })
}

export function useTopTrades(params: TopTradesParams) {
  const refetchInterval = usePollingInterval(POLL.social)
  return useQuery({
    queryKey: discoveryKeys.topTrades(params),
    queryFn: () => fetchTopTrades(params),
    refetchInterval,
  })
}

export function usePopularLeaders() {
  return useQuery({ queryKey: discoveryKeys.popularLeaders(), queryFn: fetchPopularLeaders })
}

export function useWalletIdentities(addresses: string[]) {
  const sorted = [...addresses].map((address) => address.toLowerCase()).sort()
  return useQuery({
    queryKey: discoveryKeys.identities(sorted),
    queryFn: () => fetchWalletIdentities(sorted),
    enabled: sorted.length > 0,
    staleTime: 10 * 60_000,
  })
}
