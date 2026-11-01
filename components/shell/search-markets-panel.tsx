"use client"

import { Search, Star, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { SlidingHighlight } from "@/components/ui/sliding-highlight"
import { useMeasuredBox } from "@/hooks/use-measured-box"
import type { Market } from "@/lib/api/types/markets"
import { cn } from "@/lib/utils"
import { SearchMarketsCard } from "./search-markets-card"
import { formatMarketCompact, marketTicker, marketTradeHref } from "./search-markets-format"
import { SearchMarketsRow } from "./search-markets-row"
import { SearchMarketsSortHeader, type SearchSort, type SearchSortKey } from "./search-markets-sort-header"
import { useFavoriteMarkets } from "./use-favorite-markets"
import { useSearchMarketRows, type SearchMarketRow } from "./use-search-market-rows"

type LabelMode = "names" | "tickers"

const FAVORITES = "Favorites"
const CATEGORY_ORDER = ["Crypto", "Stocks", "Startups", "Indices / ETFs", "Commodities", "FX", "Rates"]
const FEATURED_MARKETS = ["BTC", "xyz:SP500", "xyz:CL", "xyz:XYZ100"]
const LISTED_CRYPTO = new Set(["BTC", "ETH", "HYPE", "SOL"])
const LABEL_MODES: LabelMode[] = ["names", "tickers"]

function marketLabel(market: Market, mode: LabelMode): string {
  return (mode === "names" && market.displayName) || marketTicker(market.name)
}

function hiddenByDefault(market: Market): boolean {
  return market.category === "Crypto" && !LISTED_CRYPTO.has(market.name)
}

function matchesQuery(market: Market, query: string): boolean {
  if (!query) return true
  return (
    marketTicker(market.name).toLowerCase().includes(query) ||
    (market.displayName ?? "").toLowerCase().includes(query) ||
    (market.dex !== "default" && (market.dexLabel ?? "").toLowerCase().includes(query))
  )
}

function isExactMatch(market: Market, query: string): boolean {
  return (
    !!query &&
    (marketTicker(market.name).toLowerCase() === query || (market.displayName ?? "").toLowerCase() === query)
  )
}

function sortValue(row: SearchMarketRow, key: SearchSortKey, mode: LabelMode): string | number | null {
  switch (key) {
    case "name":
      return marketLabel(row.market, mode).toLowerCase()
    case "price":
      return row.price
    case "change":
      return row.change
    case "oi":
      return row.openInterest
    case "volume":
      return row.volume
  }
}

export function SearchMarketsPanel({
  query,
  onQuery,
  inputRef,
  onClose,
}: {
  query: string
  onQuery: (query: string) => void
  inputRef: RefObject<HTMLInputElement | null>
  onClose: () => void
}) {
  const router = useRouter()
  const { rows, isLoading } = useSearchMarketRows()
  const { favorites, toggle } = useFavoriteMarkets()
  const [category, setCategory] = useState<string | null>(null)
  const [mode, setMode] = useState<LabelMode>("names")
  const [sort, setSort] = useState<SearchSort>({ key: "volume", desc: true })
  const [selection, setSelection] = useState({ index: 0, resetKey: "" })
  const tabsRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLTableSectionElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const tabBox = useMeasuredBox(tabsRef, '[aria-selected="true"]', category)

  const needle = query.trim().toLowerCase()
  const resetKey = `${needle}|${category}|${sort.key}|${sort.desc}`
  const selected = selection.resetKey === resetKey ? selection.index : 0
  const select = (index: number) => setSelection({ index, resetKey })

  const categories = useMemo(() => {
    const present = new Set(rows.map((row) => row.market.category))
    return [
      null,
      ...(favorites.size ? [FAVORITES] : []),
      ...CATEGORY_ORDER.filter((name) => present.has(name)),
    ]
  }, [rows, favorites.size])

  const scoped = useMemo(
    () =>
      rows.filter(({ market }) => {
        if (category === FAVORITES) return favorites.has(market.name)
        if (category) return market.category === category
        return needle ? true : !hiddenByDefault(market)
      }),
    [rows, category, favorites, needle],
  )

  const featured = useMemo(
    () =>
      needle || category
        ? []
        : FEATURED_MARKETS.map((name) => scoped.find((row) => row.market.name === name)).filter(
            (row): row is SearchMarketRow => !!row,
          ),
    [scoped, needle, category],
  )

  const results = useMemo(
    () =>
      scoped
        .filter(({ market }) => matchesQuery(market, needle))
        .sort((a, b) => {
          const exactA = isExactMatch(a.market, needle)
          const exactB = isExactMatch(b.market, needle)
          if (exactA !== exactB) return Number(exactB) - Number(exactA)
          const valueA = sortValue(a, sort.key, mode)
          const valueB = sortValue(b, sort.key, mode)
          if (valueA === null || valueB === null) return Number(valueA === null) - Number(valueB === null)
          const order =
            typeof valueA === "string" && typeof valueB === "string"
              ? valueA.localeCompare(valueB)
              : Number(valueA) - Number(valueB)
          return sort.desc ? -order : order
        }),
    [scoped, needle, sort, mode],
  )

  const totalVolume =
    results.length && results.every((row) => row.volume !== null)
      ? results.reduce((sum, row) => sum + (row.volume ?? 0), 0)
      : null

  const open = (name: string) => router.push(marketTradeHref(name))

  useEffect(() => {
    bodyRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" })
  }, [selected])

  useEffect(() => {
    if (window.matchMedia("(max-width: 799px)").matches) mobileInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const targets = [inputRef.current, mobileInputRef.current].filter(
      (node): node is HTMLInputElement => !!node,
    )
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setSelection({ index: Math.min(selected + 1, results.length - 1), resetKey })
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        setSelection({ index: Math.max(selected - 1, 0), resetKey })
      } else if (event.key === "Enter" && results[selected]) {
        router.push(marketTradeHref(results[selected].market.name))
      } else if (event.key === "Escape") {
        onClose()
      }
    }
    targets.forEach((node) => node.addEventListener("keydown", onKeyDown))
    return () => targets.forEach((node) => node.removeEventListener("keydown", onKeyDown))
  }, [inputRef, results, selected, resetKey, router, onClose])

  const onSort = (key: SearchSortKey) =>
    setSort((current) => (current.key === key ? { key, desc: !current.desc } : { key, desc: key !== "name" }))

  return (
    <div
      id="market-search-panel"
      className="absolute inset-x-[0.1875rem] top-[calc(100%-1px)] z-40 flex max-h-[calc(100dvh-4rem)] flex-col overflow-hidden rounded-[0.625rem] border border-line-soft bg-panel text-ink shadow-xl sm:right-auto sm:w-[min(55rem,calc(100vw-0.375rem))] sm:[zoom:0.75]"
    >
      <div className="flex items-center gap-2 p-2 sm:hidden">
        <label className="relative flex-1">
          <Search
            size="0.875rem"
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-quiet"
          />
          <input
            ref={mobileInputRef}
            value={query}
            placeholder="Search markets"
            aria-label="Search markets"
            onChange={(event) => onQuery(event.target.value)}
            className="h-9 w-full rounded-[0.4375rem] bg-panel-2 pl-8 pr-2.5 text-[0.875rem] text-ink outline-none placeholder:text-ink-quiet dark:bg-panel-3"
          />
        </label>
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="p-1.5 text-ink-quiet hover:text-ink"
        >
          <X size="1rem" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-3 border-b border-line-soft px-3 py-2">
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Category"
          className="[scrollbar-width:none] relative -mx-1 flex min-w-0 flex-1 gap-0.5 overflow-x-auto px-1"
        >
          <SlidingHighlight box={tabBox} className="rounded-[0.375rem] bg-panel-2 dark:bg-panel-3" />
          {categories.map((name) => (
            <button
              key={name ?? "all"}
              type="button"
              role="tab"
              aria-selected={category === name}
              onClick={() => setCategory(name)}
              className={cn(
                "relative z-[1] inline-flex shrink-0 items-center gap-1 rounded-[0.375rem] px-2.5 py-1 text-[0.8125rem] font-medium transition-colors",
                category === name ? "text-ink" : "text-ink-quiet hover:text-ink",
              )}
            >
              {name === FAVORITES ? (
                <Star size="0.75rem" aria-hidden="true" className="fill-current" />
              ) : null}
              {name ?? "All"}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Show markets by"
          className="hidden shrink-0 rounded-[0.4375rem] bg-panel-2 p-0.5 sm:flex dark:bg-panel-3"
        >
          {LABEL_MODES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
              className={cn(
                "rounded-[0.3125rem] px-2.5 py-0.5 text-[0.75rem] font-medium capitalize transition-colors",
                mode === option ? "bg-panel text-ink shadow-sm" : "text-ink-quiet hover:text-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {featured.length > 0 ? (
          <div className="[scrollbar-width:none] grid auto-cols-[minmax(11.875rem,1fr)] grid-flow-col gap-2 overflow-x-auto p-3">
            {featured.map((row) => (
              <SearchMarketsCard
                key={row.market.name}
                row={row}
                label={marketLabel(row.market, mode)}
                starred={favorites.has(row.market.name)}
                onStar={() => toggle(row.market.name)}
                onOpen={() => open(row.market.name)}
              />
            ))}
          </div>
        ) : null}
        <table className="w-full whitespace-nowrap text-left text-[1.25rem] sm:table-fixed">
          <colgroup>
            <col className="sm:w-[3.5rem]" />
            <col className="sm:w-[30%]" />
            <col className="sm:w-[18%]" />
            <col className="sm:w-[16%]" />
            <col className="sm:w-[18%]" />
            <col className="sm:w-[18%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-panel text-[0.875rem] text-ink-quiet">
            <tr className="border-b border-line-soft">
              <th className="w-px py-2.5 pl-4 pr-3" aria-label="Favorite" />
              <SearchMarketsSortHeader label="Market" sortKey="name" sort={sort} onSort={onSort} />
              <SearchMarketsSortHeader
                label="Last price"
                sortKey="price"
                sort={sort}
                onSort={onSort}
                className="max-sm:text-right"
              />
              <SearchMarketsSortHeader
                label="24h change"
                sortKey="change"
                sort={sort}
                onSort={onSort}
                className="max-sm:text-right"
              />
              <SearchMarketsSortHeader
                label="Open positions"
                sortKey="oi"
                sort={sort}
                onSort={onSort}
                className="hidden sm:table-cell"
              />
              <SearchMarketsSortHeader
                label="Volume"
                sortKey="volume"
                sort={sort}
                onSort={onSort}
                className="hidden pr-4 sm:table-cell"
              />
            </tr>
          </thead>
          <tbody ref={bodyRef}>
            {results.map((row, index) => (
              <SearchMarketsRow
                key={row.market.name}
                row={row}
                index={index}
                label={marketLabel(row.market, mode)}
                selected={index === selected}
                starred={favorites.has(row.market.name)}
                onStar={() => toggle(row.market.name)}
                onHover={() => select(index)}
                onOpen={() => open(row.market.name)}
              />
            ))}
            {results.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-ink-quiet">
                  {isLoading ? "Loading markets…" : "No markets found"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 border-t border-line-soft px-3 py-2 text-[0.75rem] text-ink-quiet">
        <span>{results.length} markets</span>
        <span aria-hidden="true" className="h-3 w-px bg-line-soft" />
        <span>{formatMarketCompact(totalVolume)} volume</span>
      </div>
    </div>
  )
}
