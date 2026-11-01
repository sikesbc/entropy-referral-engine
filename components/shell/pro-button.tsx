import { ArrowUpRight } from "lucide-react"

export function ProButton() {
  return (
    <button
      type="button"
      data-tour="mode-switch"
      aria-label="Switch to Pro"
      title="Switch to Pro"
      className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-[0.4375rem] bg-panel-2 px-2.5 text-[0.8125rem] font-medium text-ink-quiet transition-colors hover:bg-black/[0.04] hover:text-ink dark:bg-panel-3 dark:hover:bg-white/[0.06]"
    >
      Pro
      <ArrowUpRight size="0.875rem" aria-hidden="true" />
    </button>
  )
}
