import { cn } from "@/lib/utils"

const CHEVRON_POINTS = {
  prev: "11.5 15.25 5.25 9 11.5 2.75",
  next: "6.5 2.75 12.75 9 6.5 15.25",
} as const

function PagerChevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="0.875rem"
      height="0.875rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <g transform="scale(1.33333)">
        <polyline points={CHEVRON_POINTS[direction]} />
      </g>
    </svg>
  )
}

export function PagerButton({
  direction,
  disabled,
  label,
  onClick,
}: {
  direction: "prev" | "next"
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="group inline-flex h-6 items-center rounded-[0.375rem] bg-panel-2 px-1.5 text-[0.75rem] text-ink-quiet transition-colors hover:text-ink focus-visible:text-ink disabled:pointer-events-none disabled:opacity-40 dark:bg-panel-3"
    >
      {direction === "prev" ? <PagerChevron direction="prev" /> : null}
      <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
        <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className={cn(direction === "prev" ? "pl-0.5 pr-1" : "pl-1 pr-0.5")}>{label}</span>
        </span>
      </span>
      {direction === "next" ? <PagerChevron direction="next" /> : null}
    </button>
  )
}
