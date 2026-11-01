"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/lib/auth/auth-context"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { apiGet } from "./client"
import { POLL } from "./polling"
import type { FillsParams, FillsResponse } from "./types/trading"

export const tradingKeys = {
  all: ["trading"] as const,
  fills: (user: string) => [...tradingKeys.all, "fills", user.toLowerCase()] as const,
}

export const fetchFills = (params: FillsParams) => apiGet<FillsResponse>("/api/trading/fills", { ...params })

export function useFills(params: FillsParams) {
  const { isSignedIn } = useSession()
  const refetchInterval = usePollingInterval(POLL.account)
  return useQuery({
    queryKey: tradingKeys.fills(params.user),
    queryFn: () => fetchFills(params),
    enabled: isSignedIn && params.user.length > 0,
    refetchInterval,
  })
}
