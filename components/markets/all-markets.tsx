import { Search } from "lucide-react"
import type { MarketCategory, MarketRow, MarketSort, MarketSortKey, Page } from "@/lib/markets/market-rows"
import { CategoryTabs } from "./category-tabs"
import { MarketsPager } from "./markets-pager"
import { MarketsTable } from "./markets-table"

export function AllMarkets({
  title,
  categories,
  category,
  onCategoryChange,
  query,
  onQueryChange,
  pager,
  onPageChange,
  hotNames,
  sort,
  onSort,
  isLoading,
}: {
  title: string
  categories: MarketCategory[]
  category: MarketCategory | null
  onCategoryChange: (category: MarketCategory | null) => void
  query: string
  onQueryChange: (query: string) => void
  pager: Page<MarketRow>
  onPageChange: (page: number) => void
  hotNames: Set<string>
  sort: MarketSort
  onSort: (key: MarketSortKey) => void
  isLoading: boolean
}) {
  return (
    <section className="entropy-card rounded-[0.625rem] flex flex-1 flex-col gap-1 px-3 pb-3 pt-3">
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <h2 className="mr-2 px-1 text-[1.25rem] font-semibold tracking-[-0.02em]">{title}</h2>
        <CategoryTabs categories={categories} value={category} onChange={onCategoryChange} />
        <label className="relative ml-auto w-full sm:w-[15rem]">
          <Search
            size="0.875rem"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-quiet"
          />
          <input
            value={query}
            placeholder="Search Apple, gold, Bitcoin…"
            aria-label="Search markets"
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-8 w-full rounded-full bg-panel-2 pl-9 pr-3 text-[0.8125rem] text-ink outline-none placeholder:text-ink-quiet dark:bg-panel-3"
          />
        </label>
      </div>
      <MarketsTable
        rows={pager.items}
        hotNames={hotNames}
        sort={sort}
        onSort={onSort}
        isLoading={isLoading}
      />
      <MarketsPager pager={pager} onPageChange={onPageChange} className="mt-auto px-1 before:inset-x-0" />
    </section>
  )
}
