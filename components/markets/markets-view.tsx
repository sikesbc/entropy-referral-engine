"use client"

import { useMemo, useState } from "react"
import { useMarketHighlights } from "@/lib/api/markets"
import {
  isListedInAll,
  matchesMarketSearch,
  nextSort,
  paginate,
  presentCategories,
  rowsByName,
  sortMarketRows,
  type MarketCategory,
  type MarketSort,
  type MarketSortKey,
} from "@/lib/markets/market-rows"
import { useMarketRows } from "@/lib/markets/use-market-rows"
import { AllMarkets } from "./all-markets"
import { FeaturedMarkets, type FeaturedSlide } from "./featured-markets"
import { MostTraded } from "./most-traded"
import { TopMovers, type MoverSide } from "./top-movers"

const PAGE_SIZE = 20

export function MarketsView() {
  const { rows, isLoading } = useMarketRows()
  const highlights = useMarketHighlights()
  const [category, setCategory] = useState<MarketCategory | null>(null)
  const [query, setQuery] = useState("")
  const [side, setSide] = useState<MoverSide>("gainers")
  const [sort, setSort] = useState<MarketSort>({ key: "volume", desc: true })
  const [page, setPage] = useState(0)

  const groups = useMemo(() => {
    const data = highlights.data
    const carousel = data?.carousel ?? (data?.spotlight ? [{ symbol: data.spotlight, kind: "mover" }] : [])
    const index = new Map(rows.map((row) => [row.market.name, row]))
    const slides: FeaturedSlide[] = carousel.flatMap((item) => {
      const row = index.get(item.symbol)
      return row ? [{ row, kind: item.kind }] : []
    })
    return {
      gainers: rowsByName(rows, data?.gainers),
      losers: rowsByName(rows, data?.losers),
      busiest: rowsByName(rows, data?.busiest),
      slides,
    }
  }, [rows, highlights.data])

  const hotNames = useMemo(
    () => new Set([...groups.gainers, ...groups.losers, ...groups.busiest].map((row) => row.market.name)),
    [groups],
  )

  const categories = useMemo(() => presentCategories(rows), [rows])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = rows.filter(
      ({ market }) =>
        (category ? market.category === category : isListedInAll(market)) &&
        matchesMarketSearch(market, needle),
    )
    return sortMarketRows(filtered, sort)
  }, [rows, category, query, sort])

  const pager = paginate(visible, page, PAGE_SIZE)
  const highlightsLoading = isLoading || highlights.isPending
  const isSearching = query.length > 0

  return (
    <>
      {isSearching ? null : (
        <div className="grid gap-[0.1875rem] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <FeaturedMarkets slides={groups.slides} isLoading={highlightsLoading} />
          <MostTraded title="Most traded today" rows={groups.busiest} isLoading={highlightsLoading} />
        </div>
      )}
      {isSearching ? null : (
        <TopMovers
          side={side}
          onSideChange={setSide}
          rows={side === "gainers" ? groups.gainers : groups.losers}
        />
      )}
      <AllMarkets
        title={isSearching ? "Results" : "All markets"}
        categories={categories}
        category={category}
        onCategoryChange={(next) => {
          setCategory(next)
          setPage(0)
        }}
        query={query}
        onQueryChange={(next) => {
          setQuery(next)
          setPage(0)
        }}
        pager={pager}
        onPageChange={setPage}
        hotNames={hotNames}
        sort={sort}
        onSort={(key: MarketSortKey) => {
          setPage(0)
          setSort((current) => nextSort(current, key))
        }}
        isLoading={isLoading}
      />
    </>
  )
}
