"use client"

import { useMemo } from "react"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { closedPositionsFromFills } from "@/lib/profile/closed-positions"
import { portfolioWindow } from "@/lib/profile/portfolio-history"
import { useClearinghouseState, usePortfolio, useSpotClearinghouseState } from "./hyperliquid"
import { POLL } from "./polling"
import { useFills } from "./trading"
import type { AssetPosition } from "./types/hyperliquid"

export type OpenPosition = {
  coin: string
  size: number
  entryPrice: number | null
  positionValue: number
  unrealizedPnl: number
  returnOnEquity: number
  leverage: number | null
  marginUsed: number
}

function toOpenPosition({ position }: AssetPosition): OpenPosition {
  return {
    coin: position.coin,
    size: Number(position.szi),
    entryPrice: position.entryPx === null ? null : Number(position.entryPx),
    positionValue: Number(position.positionValue),
    unrealizedPnl: Number(position.unrealizedPnl),
    returnOnEquity: Number(position.returnOnEquity),
    leverage: position.leverage?.value ?? null,
    marginUsed: Number(position.marginUsed),
  }
}

export function useProfileAccount(address: string) {
  const refetchInterval = usePollingInterval(POLL.account)
  const perp = useClearinghouseState(address, "", { refetchInterval })
  const spot = useSpotClearinghouseState(address, { refetchInterval })

  const positions = useMemo(
    () => (perp.data?.assetPositions ?? []).map(toOpenPosition).filter((position) => position.size !== 0),
    [perp.data],
  )

  const state = perp.data
  const spotTotal = (spot.data?.balances ?? []).reduce((sum, balance) => sum + Number(balance.entryNtl), 0)
  const withdrawable = state ? Number(state.withdrawable) : null

  return {
    equity: state ? Number(state.marginSummary.accountValue) + spotTotal : null,
    equityError: perp.isError,
    retryEquity: () => {
      void perp.refetch()
      void spot.refetch()
    },
    cash: withdrawable !== null && Number.isFinite(withdrawable) ? withdrawable : null,
    marginUsed: state ? Number(state.marginSummary.totalMarginUsed) : null,
    canWithdraw: withdrawable === null || withdrawable > 0,
    positions,
  }
}

export function useProfileHistory(address: string) {
  const portfolio = usePortfolio(address)
  const month = useMemo(() => portfolioWindow(portfolio.data, "month"), [portfolio.data])
  return {
    portfolio: portfolio.data,
    isPending: portfolio.isPending,
    isError: portfolio.isError,
    retry: () => void portfolio.refetch(),
    monthChange: portfolio.isPending ? null : (month?.change.usd ?? null),
  }
}

export function useProfileFills(address: string, now: number) {
  const fills = useFills({ user: address, startTime: 0, endTime: now })
  const closed = useMemo(() => closedPositionsFromFills(fills.data ?? []), [fills.data])
  return {
    fills: fills.data ?? [],
    closed,
    isLoading: fills.isLoading,
    isError: fills.isError,
    retry: () => void fills.refetch(),
  }
}
