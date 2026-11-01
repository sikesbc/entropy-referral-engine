"use client"

import { sanitizeDecimal } from "./ticket-math"

type LimitPriceFieldProps = {
  value: string
  onChange: (value: string) => void
  onUseMid: () => void
}

export function LimitPriceField({ value, onChange, onUseMid }: LimitPriceFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-[0.8125rem] text-ink-quiet">
      <span className="flex justify-between">
        Limit price
        <button type="button" onClick={onUseMid} className="text-[0.6875rem]">
          Use mid
        </button>
      </span>
      <input
        aria-label="Limit price"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(sanitizeDecimal(event.target.value))}
        className="h-10 w-full rounded-[0.5rem] bg-panel-2 px-3 font-mono text-[0.875rem] text-ink outline-none dark:bg-panel-3"
      />
    </label>
  )
}
