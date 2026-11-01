import type { PerpAssetCtx } from "@/lib/api/types/hyperliquid"
import type { Market } from "@/lib/api/types/markets"

export const DEFAULT_MARKET = "io:ANTH"

const CORE_DEX = "default"
const CORE_DEX_VOLUME_WEIGHT = 0.1

export function coinFromSegments(segments: string[] | undefined): string {
  const coin = segments?.map(decodeURIComponent).join("/")
  return coin && coin.length > 0 ? coin : DEFAULT_MARKET
}

export function marketHref(coin: string): string {
  return `/trade/${coin}`
}

export function marketSymbol(coin: string): string {
  const index = coin.indexOf(":")
  return index >= 0 ? coin.slice(index + 1) : coin
}

export function marketTicker(market: Market): string {
  return market.hyperliquidDisplayName ?? marketSymbol(market.name)
}

export function infoDex(dex: string): string {
  return dex === CORE_DEX ? "" : dex
}

export type AssetCtxMap = Map<string, PerpAssetCtx>

function rankingVolume(market: Market, contexts: AssetCtxMap): number {
  const volume = Number(contexts.get(market.name)?.dayNtlVlm ?? 0)
  return market.dex === CORE_DEX ? volume * CORE_DEX_VOLUME_WEIGHT : volume
}

export function rankMarkets(markets: Market[], contexts: AssetCtxMap): Market[] {
  return markets
    .filter((market) => !market.isDelisted)
    .map((market, index) => ({ market, index, volume: rankingVolume(market, contexts) }))
    .sort((a, b) => b.volume - a.volume || a.index - b.index)
    .map(({ market }) => market)
}

export function matchesMarketQuery(market: Market, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [market.displayName, marketTicker(market), market.name].some((value) =>
    value.toLowerCase().includes(needle),
  )
}
