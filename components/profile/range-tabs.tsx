import { cn } from "@/lib/utils"
import { PORTFOLIO_RANGES, type PortfolioRange } from "@/lib/profile/portfolio-history"

export function RangeTabs({
  value,
  onChange,
}: {
  value: PortfolioRange
  onChange: (range: PortfolioRange) => void
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-3 px-1" role="tablist" aria-label="Portfolio range">
      {PORTFOLIO_RANGES.map((option) => {
        const selected = option.range === value
        return (
          <button
            key={option.range}
            type="button"
            role="tab"
            aria-selected={selected}
            data-label={option.label}
            onClick={() => onChange(option.range)}
            className={cn(
              "inline-grid px-1 py-1 font-sans text-[0.8125rem] transition-colors after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)]",
              selected ? "font-semibold text-ink" : "font-medium text-ink-quiet hover:text-ink",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
