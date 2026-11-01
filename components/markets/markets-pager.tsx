import type { Page } from "@/lib/markets/market-rows"
import { cn } from "@/lib/utils"
import { PagerButton } from "./pager-button"

export function MarketsPager<T>({
  pager,
  onPageChange,
  className,
}: {
  pager: Page<T>
  onPageChange: (page: number) => void
  className?: string
}) {
  if (pager.pageCount <= 1) return null
  const range = `${pager.from}-${pager.to} of ${pager.total}`

  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-[0.75rem] text-ink-quiet before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-line/50 before:content-['']",
        className,
      )}
    >
      <span aria-live="polite">{range}</span>
      <nav className="flex items-center gap-0.5" aria-label={range}>
        <PagerButton
          direction="prev"
          disabled={pager.page <= 0}
          label="Prev"
          onClick={() => onPageChange(pager.page - 1)}
        />
        <PagerButton
          direction="next"
          disabled={pager.page >= pager.pageCount - 1}
          label="Next"
          onClick={() => onPageChange(pager.page + 1)}
        />
      </nav>
    </div>
  )
}
