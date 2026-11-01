"use client"

import { Percent } from "lucide-react"
import { useId } from "react"
import { sanitizeDecimal } from "./ticket-math"

export type ValueUnit = "percent" | "usd"

type TpSlInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  unit?: ValueUnit
  onToggleUnit?: () => void
}

export function TpSlInput({ label, value, onChange, onFocus, onBlur, unit, onToggleUnit }: TpSlInputProps) {
  const id = useId()
  return (
    <div className="group relative flex cursor-text items-center gap-1.5 overflow-hidden rounded-[0.5rem] bg-panel-2 px-2 py-2 dark:bg-panel-3">
      <label
        htmlFor={id}
        className="block shrink-0 overflow-hidden whitespace-nowrap text-[0.75rem] tracking-normal text-ink-quiet transition-[max-width,opacity,margin] duration-200 ease-out max-w-[7.5rem]"
      >
        {label}
      </label>
      <div className="relative flex min-w-0 flex-1 items-center overflow-hidden justify-end">
        <input
          id={id}
          inputMode="decimal"
          data-no-focus-outline="true"
          placeholder="0"
          autoComplete="off"
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(event) => onChange(sanitizeDecimal(event.target.value))}
          className="relative z-10 min-w-0 flex-1 bg-transparent font-mono text-[0.75rem] tabular-nums outline-none transition-colors duration-200 ease-out text-right text-ink"
          type="text"
        />
      </div>
      {onToggleUnit ? (
        <button
          type="button"
          data-trade-ticket-enter-skip="true"
          title="Toggle %/$"
          aria-label={unit === "usd" ? "Show as percent" : "Show as dollars"}
          onClick={onToggleUnit}
          className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-[0.375rem] px-1 text-ink-quiet transition-colors hover:bg-panel-3 hover:text-ink"
        >
          {unit === "usd" ? (
            <span className="font-mono text-[0.75rem] leading-none">$</span>
          ) : (
            <Percent strokeWidth={1} className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      ) : null}
    </div>
  )
}
