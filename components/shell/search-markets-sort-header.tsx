import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type SearchSortKey = "name" | "price" | "change" | "oi" | "volume"

export type SearchSort = { key: SearchSortKey; desc: boolean }

export function SearchMarketsSortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string
  sortKey: SearchSortKey
  sort: SearchSort
  onSort: (key: SearchSortKey) => void
  className?: string
}) {
  const active = sort.key === sortKey
  const Icon = sort.desc ? ChevronDown : ChevronUp
  return (
    <th
      aria-sort={active ? (sort.desc ? "descending" : "ascending") : undefined}
      className={cn("px-2 py-2.5 font-normal", className)}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn("inline-flex items-center gap-0.5 hover:text-ink", active && "text-ink")}
      >
        {label}
        <Icon size="0.75rem" aria-hidden="true" className={active ? undefined : "invisible"} />
      </button>
    </th>
  )
}
