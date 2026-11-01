import { cn } from "@/lib/utils"
import { SearchMarketsChange } from "./search-markets-change"
import { SearchMarketsFavorite } from "./search-markets-favorite"
import { formatMarketCompact, formatMarketPrice } from "./search-markets-format"
import { SearchMarketsIcon } from "./search-markets-icon"
import { SearchMarketsLeverage } from "./search-markets-leverage"
import type { SearchMarketRow } from "./use-search-market-rows"

export function SearchMarketsRow({
  row,
  index,
  label,
  selected,
  starred,
  onStar,
  onHover,
  onOpen,
}: {
  row: SearchMarketRow
  index: number
  label: string
  selected: boolean
  starred: boolean
  onStar: () => void
  onHover: () => void
  onOpen: () => void
}) {
  const { market } = row
  return (
    <tr
      data-index={index}
      aria-selected={selected}
      onMouseEnter={onHover}
      onClick={onOpen}
      className={cn(
        "cursor-pointer border-b border-line-soft font-mono transition-colors last:border-b-0",
        selected && "bg-ink/4 dark:bg-ink/8",
      )}
    >
      <td className="py-5 pl-4 pr-3">
        <SearchMarketsFavorite starred={starred} size="1.25rem" onToggle={onStar} />
      </td>
      <td className="py-5 pr-2 max-sm:w-full max-sm:max-w-0">
        <span className="flex min-w-0 items-center gap-3 font-sans">
          <SearchMarketsIcon market={market} size="lg" />
          <span className="truncate font-medium text-ink">{label}</span>
          {market.maxLeverage ? (
            <SearchMarketsLeverage
              leverage={market.maxLeverage}
              className="hidden h-7 px-2.5 text-[0.875rem] sm:inline-flex"
            />
          ) : null}
        </span>
      </td>
      <td className="px-2 tabular-nums text-ink max-sm:text-right">
        {formatMarketPrice(row.price, market.szDecimals)}
      </td>
      <td className="px-2 text-[1.0625rem] max-sm:text-right">
        <SearchMarketsChange change={row.change} />
      </td>
      <td className="hidden px-2 tabular-nums text-ink sm:table-cell">
        {formatMarketCompact(row.openInterest)}
      </td>
      <td className="hidden px-2 pr-4 tabular-nums text-ink sm:table-cell">
        {formatMarketCompact(row.volume)}
      </td>
    </tr>
  )
}
