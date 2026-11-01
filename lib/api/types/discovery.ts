export type WalletIdentity = {
  id: string
  address: string
  namespace: string
  generatedName: string
  name: string
  entropyUsername: string | null
  referralCode: string | null
  xUsername: string | null
  shortAddress: string
  avatarUrl: string | null
  bannerUrl: string | null
  identity: "wallet" | "entropy" | (string & {})
}

export type SmartMoneyAsset = {
  symbol: string
  longTraders: number
  shortTraders: number
  totalUsd: number
}

export type SmartMoneyResponse = {
  asOf: number
  traderCount: number
  assets: SmartMoneyAsset[]
}

export type TopTraderPosition = {
  symbol: string
  side: string
  valueUsd: number
}

export type TopTrader = {
  address: string
  realizedPnlUsd: number
  openPnlUsd: number
  totalPnlUsd: number
  volumeUsd: number
  accountValueUsd: number
  positionCount: number
  topPositions: TopTraderPosition[]
  rank: number
  wallet: WalletIdentity
  previousRank?: number
  rankJump?: number
}

export type TopTradersWindow = "7d" | "30d" | (string & {})

export type TopTradersOrder = "total_pnl" | "open_pnl" | "volume" | "rank_climb" | (string & {})

export type TopTradersParams = {
  window: TopTradersWindow
  order: TopTradersOrder
  known: boolean
}

export type TopTradersResponse = {
  asOf: number
  traders: TopTrader[]
}

export type TopTradeEvent = {
  key: string
  traderAddress: string
  kind: string
  symbol: string
  side: string
  quantity: number
  sizeUsd: number
  averagePrice: number
  entryPrice: number
  realizedPnl: number | null
  startedAt: number
  endedAt: number
  openedAt: number | null
  traderRank: number
  leverage: number
  isStillOpen: boolean
}

export type TopTradesParams = {
  feed: string
  offset: number
  limit: number
}

export type TopTradesResponse = {
  asOf: number
  traderCount: number
  events: TopTradeEvent[]
  nextOffset: number | null
}

export type PopularLeader = {
  leaderAddress: string
  subscriberCount: number
}

export type PopularLeadersResponse = {
  copied: PopularLeader[]
  countered: PopularLeader[]
}

export type WalletIdentitiesResponse = {
  items: WalletIdentity[]
}
