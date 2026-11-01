import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type PagerState = { page: number; pageCount: number; from: number; to: number; total: number }

function PagerButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next"
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight
  const label = direction === "prev" ? "Prev" : "Next"
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="group inline-flex h-6 items-center rounded-[0.375rem] bg-panel-2 px-1.5 text-[0.75rem] text-ink-quiet transition-colors hover:text-ink focus-visible:text-ink disabled:pointer-events-none disabled:opacity-40 dark:bg-panel-3"
    >
      {direction === "prev" ? <Icon size="0.875rem" className="shrink-0" aria-hidden="true" /> : null}
      <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
        <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className={direction === "prev" ? "pl-0.5 pr-1" : "pl-1 pr-0.5"}>{label}</span>
        </span>
      </span>
      {direction === "next" ? <Icon size="0.875rem" className="shrink-0" aria-hidden="true" /> : null}
    </button>
  )
}

export function TablePager({
  pager,
  onPageChange,
  className,
}: {
  pager: PagerState
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
          onClick={() => onPageChange(pager.page - 1)}
        />
        <PagerButton
          direction="next"
          disabled={pager.page >= pager.pageCount - 1}
          onClick={() => onPageChange(pager.page + 1)}
        />
      </nav>
    </div>
  )
}
