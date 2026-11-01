"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatMarketPrice, formatMarketVolume } from "@/lib/markets/format"
import { tradeHref, type MarketRow, type MarketSort, type MarketSortKey } from "@/lib/markets/market-rows"
import { cn } from "@/lib/utils"
import { ChangeBadge } from "./change-badge"
import { MarketIdentity } from "./market-identity"
import { SortHeader } from "@/components/ui/sort-header"

const COLUMNS: { key: MarketSortKey; label: string; className?: string }[] = [
  { key: "name", label: "Market" },
  { key: "price", label: "Price", className: "text-right" },
  { key: "change", label: "24h change", className: "text-right" },
  { key: "volume", label: "24h volume", className: "text-right" },
  { key: "oi", label: "Open positions", className: "hidden text-right md:table-cell" },
]

export function MarketsTable({
  rows,
  hotNames,
  sort,
  onSort,
  isLoading,
}: {
  rows: MarketRow[]
  hotNames: Set<string>
  sort: MarketSort
  onSort: (key: MarketSortKey) => void
  isLoading: boolean
}) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left text-[0.875rem]">
        <thead className="text-[0.75rem] text-ink-quiet">
          <tr>
            {COLUMNS.map((column) => (
              <SortHeader
                key={column.key}
                label={column.label}
                isActive={sort.key === column.key}
                isDescending={sort.desc}
                onSort={() => onSort(column.key)}
                className={cn("first:pl-0", column.className)}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.market.name}
              onClick={() => router.push(tradeHref(row.market.name))}
              className="border-t border-line-soft font-mono cursor-pointer transition-colors hover:bg-ink/4 dark:hover:bg-ink/8"
            >
              <td className="py-3 pr-2 text-[0.875rem]">
                <Link
                  href={tradeHref(row.market.name)}
                  onClick={(event) => event.stopPropagation()}
                  className="flex items-center gap-2"
                >
                  <MarketIdentity market={row.market} hot={hotNames.has(row.market.name)} />
                </Link>
              </td>
              <td className="px-2 text-right font-semibold tabular-nums text-ink">
                {formatMarketPrice(row.price, row.market.szDecimals)}
              </td>
              <td className="px-2 text-right">
                <ChangeBadge change={row.change} className="px-1.5 py-0.5 text-[0.8125rem] font-semibold" />
              </td>
              <td className="px-2 text-right tabular-nums text-ink">{formatMarketVolume(row.volume)}</td>
              <td className="hidden px-2 text-right tabular-nums text-ink md:table-cell">
                {formatMarketVolume(row.oi)}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="py-10 text-center font-sans text-[0.8125rem] text-ink-quiet"
              >
                {isLoading ? "Loading markets…" : "No markets found"}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
