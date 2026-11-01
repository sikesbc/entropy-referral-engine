import type { MeasuredBox } from "@/hooks/use-measured-box"
import { cn } from "@/lib/utils"

export function SlidingHighlight({ box, className }: { box: MeasuredBox | null; className?: string }) {
  if (!box) return null
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transition-[transform,width,height] duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        className,
      )}
      style={{ width: box.width, height: box.height, transform: `translate(${box.left}px, ${box.top}px)` }}
    />
  )
}
