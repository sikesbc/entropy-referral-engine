"use client"

import { useMemo } from "react"
import { useClearinghouseState } from "@/lib/api/hyperliquid"
import { useOpenOrders } from "@/lib/api/orders"
import { POLL } from "@/lib/api/polling"
import { useFills } from "@/lib/api/trading"
import type { PlacedOrder } from "@/lib/api/types/orders"
import { useSession } from "@/lib/auth/auth-context"
import { useNow, usePollingInterval } from "@/lib/runtime/runtime-context"

const HISTORY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
const MINUTE_MS = 60_000

export type OpenPosition = {
  coin: string
  size: number
  entryPx: number | null
  markPx: number | null
  marginUsed: number
  unrealizedPnl: number
  returnOnEquity: number
  leverage: number
}

export type ClosedTrade = {
  id: string
  coin: string
  isLong: boolean
  size: number
  entryPx: number
  exitPx: number
  pnl: number
  closedAt: number
}

export type AccountActivity = {
  positions: OpenPosition[]
  orders: PlacedOrder[]
  history: ClosedTrade[]
  loading: boolean
  error: boolean
}

export function useAccountActivity(dex: string): AccountActivity {
  const { isSignedIn, user } = useSession()
  const address = isSignedIn ? (user?.walletAddress ?? "") : ""
  const refetchInterval = usePollingInterval(POLL.account)
  const now = Math.floor(useNow(MINUTE_MS) / MINUTE_MS) * MINUTE_MS
  const main = useClearinghouseState(address, "", { refetchInterval })
  const builder = useClearinghouseState(address, dex, { enabled: dex !== "", refetchInterval })
  const fills = useFills({ user: address, startTime: now - HISTORY_WINDOW_MS, endTime: now })
  const orders = useOpenOrders()

  const positions = useMemo(
    () =>
      [main.data, dex === "" ? undefined : builder.data]
        .flatMap((state) => state?.assetPositions ?? [])
        .map(({ position }): OpenPosition => {
          const size = Number(position.szi)
          return {
            coin: position.coin,
            size,
            entryPx: position.entryPx === null ? null : Number(position.entryPx),
            markPx: size === 0 ? null : Math.abs(Number(position.positionValue) / size),
            marginUsed: Number(position.marginUsed),
            unrealizedPnl: Number(position.unrealizedPnl),
            returnOnEquity: Number(position.returnOnEquity),
            leverage: position.leverage.value,
          }
        })
        .filter((position) => position.size !== 0),
    [main.data, builder.data, dex],
  )

  const history = useMemo(
    () =>
      (fills.data ?? [])
        .filter((fill) => fill.dir.startsWith("Close") && Number(fill.sz) > 0)
        .map((fill): ClosedTrade => {
          const size = Number(fill.sz)
          const exitPx = Number(fill.px)
          const pnl = Number(fill.closedPnl)
          const isLong = fill.dir.includes("Long")
          return {
            id: `${fill.hash}:${fill.tid}`,
            coin: fill.coin,
            isLong,
            size,
            entryPx: exitPx - (isLong ? pnl : -pnl) / size,
            exitPx,
            pnl,
            closedAt: fill.time,
          }
        })
        .sort((a, b) => b.closedAt - a.closedAt),
    [fills.data],
  )

  return {
    positions,
    orders: orders.data ?? [],
    history,
    loading: main.isPending && fills.isPending,
    error: main.isError || fills.isError,
  }
}
