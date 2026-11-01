import { cn } from "@/lib/utils"

export function DiscoverNavHeading({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn(
        "hidden px-2 pb-1.5 pt-1 text-[0.6875rem] font-medium tracking-[0.12em] text-ink-quiet lg:block",
        className,
      )}
    >
      {text}
    </span>
  )
}
