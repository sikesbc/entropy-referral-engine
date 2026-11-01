import { EARNINGS_RANGES, type EarningsRange } from "./earnings-range"

const RANGE_TAB_CLASS =
  "inline-grid px-1 py-1 font-sans text-[0.8125rem] transition-colors after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)]"

export function EarningsRangeTabs({
  value,
  onChange,
}: {
  value: EarningsRange
  onChange: (value: EarningsRange) => void
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-3 px-1" role="tablist" aria-label="Earnings range">
      {EARNINGS_RANGES.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            data-label={option.label}
            onClick={() => onChange(option.value)}
            className={`${RANGE_TAB_CLASS} ${selected ? "font-semibold text-ink" : "font-medium text-ink-quiet hover:text-ink"}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
