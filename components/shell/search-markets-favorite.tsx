import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchMarketsFavorite({
  starred,
  size,
  onToggle,
}: {
  starred: boolean
  size: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={starred ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={starred}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      className={cn(
        "flex transition-colors",
        starred ? "text-[var(--entropy-orange)]" : "text-ink-quiet hover:text-ink",
      )}
    >
      <Star size={size} aria-hidden="true" className={starred ? "fill-current" : undefined} />
    </button>
  )
}
