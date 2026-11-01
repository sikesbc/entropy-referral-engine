import { shortAddress } from "@/lib/format/address"
import type { TopTradeEvent, WalletIdentity } from "@/lib/api/types/discovery"
import type { Market } from "@/lib/api/types/markets"

export type MarketMap = Map<string, Market>

export type FeedTrader = Pick<
  WalletIdentity,
  "address" | "name" | "avatarUrl" | "shortAddress" | "entropyUsername" | "xUsername"
> & { id: string | null }

export type TradeEventResult = { pnlUsd: number | null; returnFraction: number | null }

export type PositionSpan = {
  symbol: string
  entryPrice: number
  entryTime: number | null
  startTime: number
  exit: { time: number; price: number } | null
}

export function buildMarketMap(markets: Market[] | undefined): MarketMap {
  return new Map(
    (markets ?? []).filter((market) => !market.isDelisted).map((market) => [market.name, market]),
  )
}

export function symbolBase(symbol: string): string {
  const separator = symbol.indexOf(":")
  return separator === -1 ? symbol : symbol.slice(separator + 1)
}

export function marketDisplayName(symbol: string, market: Market | null | undefined): string {
  return market?.displayName || symbolBase(symbol)
}

export function marketTradePath(market: Market): string {
  const separator = market.name.indexOf(":")
  const dex = separator === -1 ? "" : market.name.slice(0, separator + 1)
  return `/trade/${dex}${market.hyperliquidDisplayName ?? symbolBase(market.name)}`
}

export function isClosedEvent(event: TopTradeEvent): boolean {
  return event.kind === "closed"
}

export function tradeEventResult(
  event: TopTradeEvent,
  mark: number | null,
  leverage: number | null,
): TradeEventResult {
  const direction = event.side === "long" ? 1 : -1
  const exitPrice = isClosedEvent(event) ? event.averagePrice : mark
  if (exitPrice == null || !(exitPrice > 0) || !(event.entryPrice > 0)) {
    return { pnlUsd: event.realizedPnl, returnFraction: null }
  }
  const pnlUsd = event.realizedPnl ?? (exitPrice - event.entryPrice) * event.quantity * direction
  const notional = event.entryPrice * event.quantity
  return {
    pnlUsd,
    returnFraction: leverage == null || !(notional > 0) ? null : (pnlUsd / notional) * leverage,
  }
}

export function positionSpan(event: TopTradeEvent): PositionSpan {
  const closed = isClosedEvent(event)
  return {
    symbol: event.symbol,
    entryPrice: event.entryPrice,
    entryTime: closed ? event.openedAt : event.startedAt,
    startTime: closed ? (event.openedAt ?? event.startedAt) : event.startedAt,
    exit: closed ? { time: event.endedAt, price: event.averagePrice } : null,
  }
}

export function filterFeedEvents(events: TopTradeEvent[], feed: string): TopTradeEvent[] {
  return events
    .filter((event) =>
      feed === "closes" ? event.kind === "closed" : feed !== "opens" || event.kind === "opened",
    )
    .sort((a, b) => b.endedAt - a.endedAt)
}

export function uniqueByKey(events: TopTradeEvent[]): TopTradeEvent[] {
  const seen = new Set<string>()
  return events.filter((event) => {
    if (seen.has(event.key)) return false
    seen.add(event.key)
    return true
  })
}

export function traderFromIdentity(identity: WalletIdentity): FeedTrader {
  return {
    id: identity.id,
    address: identity.address.toLowerCase(),
    name: identity.name,
    avatarUrl: identity.avatarUrl,
    shortAddress: identity.shortAddress,
    entropyUsername: identity.entropyUsername,
    xUsername: identity.xUsername,
  }
}

export function fallbackTrader(address: string): FeedTrader {
  const short = shortAddress(address)
  return {
    id: null,
    address: address.toLowerCase(),
    name: short,
    avatarUrl: null,
    shortAddress: short,
    entropyUsername: null,
    xUsername: null,
  }
}
