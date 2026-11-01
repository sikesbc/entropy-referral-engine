import { SearchMarketsChange } from "./search-markets-change"
import { SearchMarketsFavorite } from "./search-markets-favorite"
import { formatMarketCompact, formatMarketPrice } from "./search-markets-format"
import { SearchMarketsIcon } from "./search-markets-icon"
import { SearchMarketsLeverage } from "./search-markets-leverage"
import type { SearchMarketRow } from "./use-search-market-rows"

export function SearchMarketsCard({
  row,
  label,
  starred,
  onStar,
  onOpen,
}: {
  row: SearchMarketRow
  label: string
  starred: boolean
  onStar: () => void
  onOpen: () => void
}) {
  const { market } = row
  return (
    <div
      role="link"
      tabIndex={-1}
      onClick={onOpen}
      className="cursor-pointer rounded-[0.625rem] bg-panel-2 p-4 transition-shadow hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.05)] dark:bg-panel-3 dark:hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.18)]"
    >
      <div className="flex items-center gap-2">
        <SearchMarketsIcon market={market} size="md" />
        <span className="truncate text-[1rem] font-medium">{label}</span>
        {market.maxLeverage ? (
          <SearchMarketsLeverage
            leverage={market.maxLeverage}
            className="inline-flex h-5 px-2 text-[0.6875rem] leading-none"
          />
        ) : null}
        <span className="ml-auto">
          <SearchMarketsFavorite starred={starred} size="1.125rem" onToggle={onStar} />
        </span>
      </div>
      <div className="mt-4 truncate font-mono text-[1.5rem] tabular-nums">
        {formatMarketPrice(row.price, market.szDecimals)}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-line-soft pt-3 text-[0.9375rem] text-ink-quiet">
        Vol
        <span className="rounded-[0.25rem] bg-ink/6 px-1.5 py-0.5 font-mono tabular-nums text-ink-soft">
          {formatMarketCompact(row.volume)}
        </span>
        <SearchMarketsChange change={row.change} className="ml-auto shrink-0 text-[0.875rem]" />
      </div>
    </div>
  )
}
