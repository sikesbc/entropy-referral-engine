import { cn } from "@/lib/utils"

export function DiscoverNavItem({
  title,
  isActive,
  onClick,
}: {
  title: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "flex shrink-0 flex-col gap-0.5 rounded-[0.5rem] px-2.5 py-2 text-left transition-colors lg:w-full",
        isActive ? "bg-panel-2 dark:bg-panel-3" : "hover:bg-panel-2 dark:hover:bg-panel-3",
      )}
    >
      <span className="whitespace-nowrap text-[0.8125rem] font-medium text-ink">{title}</span>
    </button>
  )
}
