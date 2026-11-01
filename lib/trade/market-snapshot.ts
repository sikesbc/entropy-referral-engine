"use client"

import { useMarkets, useMobileListings } from "@/lib/api/markets"
import { useMetaAndAssetCtxs } from "@/lib/api/hyperliquid"
import type { PerpAssetCtx } from "@/lib/api/types/hyperliquid"

export type MarketSnapshot = {
  coin: string
  dex: string
  name: string
  maxLeverage: number | null
  szDecimals: number
  ctx: PerpAssetCtx | null
  markPx: number | null
  description: string | null
}

export function coinDex(coin: string): string {
  const separator = coin.indexOf(":")
  return separator === -1 ? "" : coin.slice(0, separator)
}

export function coinTicker(coin: string): string {
  const separator = coin.indexOf(":")
  return separator === -1 ? coin : coin.slice(separator + 1)
}

export function useMarketSnapshot(coin: string): MarketSnapshot {
  const dex = coinDex(coin)
  const markets = useMarkets()
  const listings = useMobileListings()
  const metaAndCtxs = useMetaAndAssetCtxs(dex)

  const market = markets.data?.markets.find((entry) => entry.name === coin)
  const listing = listings.data?.items.find((entry) => entry.symbol === coin)
  const universe = metaAndCtxs.data?.[0].universe ?? []
  const assetIndex = universe.findIndex((asset) => asset.name === coin)
  const asset = assetIndex === -1 ? undefined : universe[assetIndex]
  const ctx = assetIndex === -1 ? null : (metaAndCtxs.data?.[1][assetIndex] ?? null)
  const markPx = ctx ? Number(ctx.markPx) : null

  return {
    coin,
    dex,
    name: market?.displayName ?? listing?.displayName ?? coinTicker(coin),
    maxLeverage: market?.maxLeverage ?? asset?.maxLeverage ?? null,
    szDecimals: market?.szDecimals ?? asset?.szDecimals ?? 2,
    ctx,
    markPx: markPx !== null && Number.isFinite(markPx) && markPx > 0 ? markPx : null,
    description: listing?.description ?? null,
  }
}
