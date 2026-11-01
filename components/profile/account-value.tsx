import { formatUsd } from "@/lib/format/money"
import { cn } from "@/lib/utils"

const BASE_CLASS =
  "font-mono font-medium tabular-nums tracking-[-0.0125em] text-[1.0625rem] leading-[1.375rem]"

export function AccountValue({ value, signed = false }: { value: number | null; signed?: boolean }) {
  if (value === null) return <b className={cn(BASE_CLASS, "text-ink-quiet")}>—</b>
  if (signed) {
    return (
      <b className={cn(BASE_CLASS, value < 0 ? "text-down" : "text-up")}>
        {`${value < 0 ? "−" : "+"}${formatUsd(Math.abs(value))}`}
      </b>
    )
  }
  const text = formatUsd(value)
  const dot = text.lastIndexOf(".")
  return (
    <b className={cn(BASE_CLASS, "text-ink")}>
      {dot < 0 ? (
        text
      ) : (
        <>
          {text.slice(0, dot)}
          <span className="text-ink-quiet">{text.slice(dot)}</span>
        </>
      )}
    </b>
  )
}
