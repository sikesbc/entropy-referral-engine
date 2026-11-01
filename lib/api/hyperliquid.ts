"use client"

import { useQuery } from "@tanstack/react-query"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { apiPost } from "./client"
import { POLL } from "./polling"
import type {
  CandleInterval,
  HyperliquidInfoRequest,
  HyperliquidInfoResponse,
  HyperliquidInfoType,
} from "./types/hyperliquid"

export function hyperliquidInfo<K extends HyperliquidInfoType>(
  request: HyperliquidInfoRequest<K>,
): Promise<HyperliquidInfoResponse<K>> {
  return apiPost<HyperliquidInfoResponse<K>>("/api/hyperliquid/info", request)
}

export const hyperliquidKeys = {
  all: ["hyperliquid"] as const,
  info: (request: object) => [...hyperliquidKeys.all, request] as const,
}

type InfoOptions = { enabled?: boolean; refetchInterval?: number | false }

export function useHyperliquidInfo<K extends HyperliquidInfoType>(
  request: HyperliquidInfoRequest<K>,
  options: InfoOptions = {},
) {
  return useQuery({
    queryKey: hyperliquidKeys.info(request),
    queryFn: () => hyperliquidInfo(request),
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval ?? false,
  })
}

export function useCandles(
  coin: string,
  interval: CandleInterval,
  range: { startTime: number; endTime: number },
) {
  const refetchInterval = usePollingInterval(POLL.candles)
  return useHyperliquidInfo(
    { type: "candleSnapshot", req: { coin, interval, startTime: range.startTime, endTime: range.endTime } },
    { enabled: coin.length > 0, refetchInterval },
  )
}

export function useMetaAndAssetCtxs(dex = "") {
  const refetchInterval = usePollingInterval(POLL.markets)
  return useHyperliquidInfo({ type: "metaAndAssetCtxs", dex }, { refetchInterval })
}

export function useClearinghouseState(user: string, dex = "", options: InfoOptions = {}) {
  return useHyperliquidInfo(
    { type: "clearinghouseState", user, dex },
    { enabled: user.length > 0 && (options.enabled ?? true), refetchInterval: options.refetchInterval },
  )
}

export function useSpotClearinghouseState(user: string, options: InfoOptions = {}) {
  return useHyperliquidInfo(
    { type: "spotClearinghouseState", user },
    { enabled: user.length > 0 && (options.enabled ?? true), refetchInterval: options.refetchInterval },
  )
}

export function usePortfolio(user: string) {
  const refetchInterval = usePollingInterval(POLL.account)
  return useHyperliquidInfo({ type: "portfolio", user }, { enabled: user.length > 0, refetchInterval })
}

export function useUserFees(user: string) {
  return useHyperliquidInfo({ type: "userFees", user }, { enabled: user.length > 0 })
}

export function useLedgerUpdates(user: string, startTime: number, endTime: number) {
  const refetchInterval = usePollingInterval(POLL.account)
  return useHyperliquidInfo(
    { type: "userNonFundingLedgerUpdates", user, startTime, endTime },
    { enabled: user.length > 0, refetchInterval },
  )
}

export function useExchangeStatus() {
  return useHyperliquidInfo({ type: "exchangeStatus" })
}
