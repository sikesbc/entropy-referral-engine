import type { MetaAndAssetCtxs } from "@/lib/api/types/hyperliquid"
import type { Market } from "@/lib/api/types/markets"

export type MarketStats = {
  mark: number
  mid: number
  prev: number
  volume: number
  oi: number
}

export type MarketRow = {
  market: Market
  price: number | null
  change: number | null
  volume: number | null
  oi: number | null
}

export const MARKET_CATEGORIES = [
  "Crypto",
  "Stocks",
  "Startups",
  "Indices / ETFs",
  "Commodities",
  "FX",
  "Rates",
] as const

export type MarketCategory = (typeof MARKET_CATEGORIES)[number]

export type MarketSortKey = "name" | "price" | "change" | "volume" | "oi"

export type MarketSort = { key: MarketSortKey; desc: boolean }

const ALL_TAB_CRYPTO = new Set(["BTC", "ETH", "HYPE", "SOL"])

const RENAMED_CATEGORIES: Record<string, string> = { "Pre-IPOs": "Startups" }

export function marketDex(market: Market): string {
  return market.dex && market.dex !== "default" ? market.dex : ""
}

export function marketDexes(markets: Market[]): string[] {
  return [...new Set(markets.map(marketDex))]
}

export function marketSymbol(market: Market): string {
  return market.hyperliquidDisplayName || (market.name.split(":").pop() ?? market.name).toUpperCase()
}

export function marketTitle(market: Market): string {
  return market.displayName || marketSymbol(market)
}

export function tradeHref(name: string): string {
  return `/trade/${encodeURIComponent(name).replace(/%3A/gi, ":")}`
}

export function isListedInAll(market: Market): boolean {
  return !(market.category === "Crypto" && !ALL_TAB_CRYPTO.has(market.name))
}

export function matchesMarketSearch(market: Market, query: string): boolean {
  if (!query) return true
  const haystack = [
    marketSymbol(market),
    market.name,
    market.displayName,
    marketDex(market) ? market.dexLabel : "",
  ]
  return haystack.some((value) => (value ?? "").toLowerCase().includes(query))
}

export function parseAssetCtxs(data: MetaAndAssetCtxs | undefined): Map<string, MarketStats> {
  const stats = new Map<string, MarketStats>()
  if (!data) return stats
  const [meta, ctxs] = data
  meta.universe.forEach((asset, index) => {
    const ctx = ctxs[index]
    if (!ctx) return
    const mark = parseFloat(ctx.markPx ?? "0")
    const mid = ctx.midPx ? parseFloat(ctx.midPx) : mark
    const openInterest = parseFloat(ctx.openInterest ?? "0")
    stats.set(asset.name, {
      mark,
      mid: Number.isFinite(mid) ? mid : mark,
      prev: parseFloat(ctx.prevDayPx ?? "0"),
      volume: parseFloat(ctx.dayNtlVlm ?? "0"),
      oi: Number.isFinite(openInterest) && Number.isFinite(mark) ? openInterest * mark : 0,
    })
  })
  return stats
}

export function buildMarketRows(markets: Market[], stats: Map<string, MarketStats>): MarketRow[] {
  const rows: MarketRow[] = []
  for (const market of markets) {
    if (market.isDelisted) continue
    const entry = stats.get(market.name)
    const price = entry ? entry.mid || entry.mark || null : null
    rows.push({
      market: RENAMED_CATEGORIES[market.category]
        ? { ...market, category: RENAMED_CATEGORIES[market.category] }
        : market,
      price,
      change: price && entry && entry.prev > 0 ? (price - entry.prev) / entry.prev : null,
      volume: entry?.volume ?? null,
      oi: entry?.oi ?? null,
    })
  }
  return rows
}

export function rowsByName(rows: MarketRow[], names: string[] | undefined): MarketRow[] {
  const index = new Map(rows.map((row) => [row.market.name, row]))
  return (names ?? []).flatMap((name) => index.get(name) ?? [])
}

export function presentCategories(rows: MarketRow[]): MarketCategory[] {
  const seen = new Set(rows.map((row) => row.market.category))
  return MARKET_CATEGORIES.filter((category) => seen.has(category))
}

function sortValue(row: MarketRow, key: MarketSortKey): string | number | null {
  switch (key) {
    case "name":
      return marketTitle(row.market).toLowerCase()
    case "price":
      return row.price
    case "change":
      return row.change
    case "volume":
      return row.volume
    case "oi":
      return row.oi
  }
}

export function sortMarketRows(rows: MarketRow[], sort: MarketSort): MarketRow[] {
  return [...rows].sort((a, b) => {
    const left = sortValue(a, sort.key)
    const right = sortValue(b, sort.key)
    if (left === null || right === null) return Number(left === null) - Number(right === null)
    const order =
      typeof left === "string" && typeof right === "string"
        ? left.localeCompare(right)
        : Number(left) - Number(right)
    return sort.desc ? -order : order
  })
}

export function nextSort(current: MarketSort, key: MarketSortKey): MarketSort {
  return current.key === key ? { key, desc: !current.desc } : { key, desc: key !== "name" }
}

export type Page<T> = {
  page: number
  pageCount: number
  items: T[]
  from: number
  to: number
  total: number
}

export function paginate<T>(items: T[], page: number, size: number): Page<T> {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(0, Math.trunc(page)), pageCount - 1)
  const start = current * size
  const slice = items.slice(start, start + size)
  return {
    page: current,
    pageCount,
    items: slice,
    from: slice.length > 0 ? start + 1 : 0,
    to: start + slice.length,
    total,
  }
}
