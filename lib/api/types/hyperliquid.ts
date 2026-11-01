export type CandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | (string & {})

export type Candle = {
  t: number
  T: number
  s: string
  i: string
  o: string
  c: string
  h: string
  l: string
  v: string
  n: number
}

export type MarginTier = {
  lowerBound: string
  maxLeverage: number
}

export type MarginTable = {
  description: string
  marginTiers: MarginTier[]
}

export type PerpAsset = {
  szDecimals: number
  name: string
  maxLeverage: number
  marginTableId: number
  isDelisted?: boolean
  onlyIsolated?: boolean
  marginMode?: string
  growthMode?: string
  lastFeeScaleChangeTime?: string
  deployerFeeScale?: string
}

export type PerpMeta = {
  universe: PerpAsset[]
  marginTables: [number, MarginTable][]
  collateralToken: number
}

export type PerpAssetCtx = {
  funding: string
  openInterest: string
  prevDayPx: string
  dayNtlVlm: string
  premium: string | null
  oraclePx: string
  markPx: string
  midPx: string | null
  impactPxs: string[] | null
  dayBaseVlm: string
}

export type MetaAndAssetCtxs = [PerpMeta, PerpAssetCtx[]]

export type MarginSummary = {
  accountValue: string
  totalNtlPos: string
  totalRawUsd: string
  totalMarginUsed: string
}

export type AssetPosition = {
  type: string
  position: {
    coin: string
    szi: string
    entryPx: string | null
    positionValue: string
    unrealizedPnl: string
    returnOnEquity: string
    liquidationPx: string | null
    marginUsed: string
    maxLeverage: number
    leverage: { type: string; value: number; rawUsd?: string }
    cumFunding: { allTime: string; sinceOpen: string; sinceChange: string }
  }
}

export type ClearinghouseState = {
  marginSummary: MarginSummary
  crossMarginSummary: MarginSummary
  crossMaintenanceMarginUsed: string
  withdrawable: string
  assetPositions: AssetPosition[]
  time: number
}

export type SpotBalance = {
  coin: string
  token: number
  hold: string
  total: string
  entryNtl: string
}

export type SpotClearinghouseState = {
  balances: SpotBalance[]
}

export type SpotToken = {
  name: string
  szDecimals: number
  weiDecimals: number
  index: number
  tokenId: string
  isCanonical: boolean
  evmContract: { address: string; evm_extra_wei_decimals: number } | null
  fullName: string | null
  deployerTradingFeeShare: string
  deployerLabel?: string
}

export type SpotPair = {
  tokens: number[]
  name: string
  index: number
  isCanonical: boolean
}

export type SpotMeta = {
  universe: SpotPair[]
  tokens: SpotToken[]
}

export type SpotAssetCtx = {
  prevDayPx: string
  dayNtlVlm: string
  markPx: string
  midPx: string | null
  circulatingSupply: string
  coin: string
  totalSupply: string
  dayBaseVlm: string
}

export type SpotMetaAndAssetCtxs = [SpotMeta, SpotAssetCtx[]]

export type PortfolioWindow =
  "day" | "week" | "month" | "allTime" | "perpDay" | "perpWeek" | "perpMonth" | "perpAllTime"

export type PortfolioHistory = {
  accountValueHistory: [number, string][]
  pnlHistory: [number, string][]
  vlm: string
}

export type Portfolio = [PortfolioWindow, PortfolioHistory][]

export type UserFees = {
  dailyUserVlm: { date: string; userCross: string; userAdd: string; exchange: string }[]
  feeSchedule: {
    cross: string
    add: string
    spotCross: string
    spotAdd: string
    tiers: {
      vip: { ntlCutoff: string; cross: string; add: string; spotCross: string; spotAdd: string }[]
      mm: { makerFractionCutoff: string; add: string }[]
    }
    referralDiscount: string
    stakingDiscountTiers: { bpsOfMaxSupply: string; discount: string }[]
  }
  userCrossRate: string
  userAddRate: string
  userSpotCrossRate: string
  userSpotAddRate: string
  activeReferralDiscount: string
  trial: unknown
  feeTrialEscrow: string
  nextTrialAvailableTimestamp: number | null
  stakingLink: unknown
  activeStakingDiscount: { bpsOfMaxSupply: string; discount: string }
}

export type PerpDex = {
  name: string
  fullName: string
  deployer: string
  oracleUpdater: string | null
  feeRecipient: string | null
  assetToStreamingOiCap: [string, string][]
  subDeployers: [string, string[]][]
  assetToFundingMultiplier: [string, string][]
  assetToFundingInterestRate: [string, string][]
  assetToFundingClamp: [string, string][]
}

export type ExchangeStatus = {
  specialStatuses: unknown
  time: number
}

export type DelegatorSummary = {
  delegated: string
  undelegated: string
  totalPendingWithdrawal: string
  nPendingWithdrawals: number
}

export type BorrowLendReserveState = {
  borrowYearlyRate: string
  supplyYearlyRate: string
  balance: string
  utilization: string
  oraclePx: string
  ltv: string
  totalSupplied: string
  totalBorrowed: string
}

export type BorrowLendUserState = {
  tokenToState: unknown[]
  health: string
  healthFactor: string | null
}

export type LedgerUpdate = {
  time: number
  hash: string
  delta: { type: string } & Record<string, unknown>
}

export type HyperliquidInfoMap = {
  candleSnapshot: {
    request: { req: { coin: string; interval: CandleInterval; startTime: number; endTime: number } }
    response: Candle[]
  }
  metaAndAssetCtxs: { request: { dex?: string }; response: MetaAndAssetCtxs }
  spotMetaAndAssetCtxs: { request: Record<never, never>; response: SpotMetaAndAssetCtxs }
  spotMeta: { request: Record<never, never>; response: SpotMeta }
  allPerpMetas: { request: Record<never, never>; response: PerpMeta[] }
  perpDexs: { request: Record<never, never>; response: (PerpDex | null)[] }
  exchangeStatus: { request: Record<never, never>; response: ExchangeStatus }
  clearinghouseState: { request: { user: string; dex?: string }; response: ClearinghouseState }
  spotClearinghouseState: { request: { user: string }; response: SpotClearinghouseState }
  portfolio: { request: { user: string }; response: Portfolio }
  userFees: { request: { user: string }; response: UserFees }
  userNonFundingLedgerUpdates: {
    request: { user: string; startTime: number; endTime?: number }
    response: LedgerUpdate[]
  }
  userVaultEquities: { request: { user: string }; response: unknown[] }
  delegatorSummary: { request: { user: string }; response: DelegatorSummary }
  extraAgents: { request: { user: string }; response: unknown[] }
  maxBuilderFee: { request: { user: string; builder: string }; response: number }
  userAbstraction: { request: { user: string }; response: string }
  borrowLendUserState: { request: { user: string }; response: BorrowLendUserState }
  allBorrowLendReserveStates: { request: Record<never, never>; response: [number, BorrowLendReserveState][] }
}

export type HyperliquidInfoType = keyof HyperliquidInfoMap

export type HyperliquidInfoRequest<K extends HyperliquidInfoType> = {
  type: K
} & HyperliquidInfoMap[K]["request"]

export type HyperliquidInfoResponse<K extends HyperliquidInfoType> = HyperliquidInfoMap[K]["response"]
