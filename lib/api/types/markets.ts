export type Market = {
  name: string
  displayName: string
  category: string
  isMarketCapBased: boolean
  isDefault: boolean
  assetId: number
  dex: string
  dexName: string
  dexLabel: string
  assetUrl: string
  maxLeverage: number
  onlyIsolated: boolean
  isDelisted: boolean
  isSpotlighted: boolean
  spotlightOrder: number | null
  marginMode: string | null
  szDecimals: number
  hyperliquidDisplayName?: string
  perpAnnotationName?: string
}

export type MarketsResponse = {
  defaultMarket: string
  markets: Market[]
  dexes: string[]
  source: string
}

export type MarketHighlightsCarouselItem = {
  symbol: string
  kind: string
}

export type MarketHighlightsResponse = {
  gainers: string[]
  losers: string[]
  busiest: string[]
  movers: string[]
  spotlight: string
  asOf: number
  nextUpdateAt: number
  carousel: MarketHighlightsCarouselItem[]
}

export type LiveTick = [timestampSeconds: number, price: number]

export type LiveTicksResponse = LiveTick[]

export type MobileListing = {
  symbol: string
  displayName: string
  category: string
  isMobileListed: boolean
  isWebListed: boolean
  isDelisted: boolean
  sourceIconUrl: string | null
  logoVersion: number
  underlyingTicker: string | null
  underlyingName: string | null
  underlyingCategory: string | null
  shareCount: number | null
  description?: string
}

export type MobileListingsResponse = {
  items: MobileListing[]
  version: string
}
