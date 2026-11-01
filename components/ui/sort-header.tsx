import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function SortHeader({
  label,
  isActive,
  isDescending,
  onSort,
  isRightAligned = false,
  className,
}: {
  label: string
  isActive: boolean
  isDescending: boolean
  onSort: () => void
  isRightAligned?: boolean
  className?: string
}) {
  const Icon = isDescending ? ChevronDown : ChevronUp
  return (
    <th
      scope="col"
      aria-sort={isActive ? (isDescending ? "descending" : "ascending") : undefined}
      className={cn("px-2 py-3 font-medium", className)}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "inline-flex items-center gap-0.5 hover:text-ink",
          isRightAligned && "flex-row-reverse",
          isActive && "font-semibold text-ink",
        )}
      >
        {label}
        <Icon size="0.75rem" aria-hidden="true" className={isActive ? undefined : "invisible"} />
      </button>
    </th>
  )
}
