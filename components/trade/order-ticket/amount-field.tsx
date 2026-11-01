"use client"

import { formatUsd } from "@/lib/format/money"
import { cn } from "@/lib/utils"
import { AMOUNT_PRESETS, parseDecimal, sanitizeDecimal } from "./ticket-math"

type AmountFieldProps = {
  amount: string
  available: number | null
  onChange: (amount: string) => void
}

const CHIP_CLASS =
  "lite-raised-chip h-7 rounded-[0.5rem] font-mono text-[0.8125rem] font-semibold disabled:opacity-40"

export function AmountField({ amount, available, onChange }: AmountFieldProps) {
  const value = parseDecimal(amount)
  const maxValue = available !== null && available > 0 ? Math.floor(available * 100) / 100 : null
  const presets = [
    ...AMOUNT_PRESETS.map((preset) => ({
      label: `$${preset}`,
      value: preset,
      disabled: available === null || available < preset,
    })),
    { label: "Max", value: maxValue ?? 0, disabled: maxValue === null },
  ]

  return (
    <div data-tour="amount" className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[0.8125rem]">
        <label htmlFor="lite-amount" className="text-ink-quiet">
          Amount
        </label>
        <span className="text-[0.75rem] text-ink-quiet">
          Available{" "}
          <span className="font-mono text-ink">{available === null ? "—" : formatUsd(available)}</span>
        </span>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-2.5 font-mono text-ink-quiet">$</span>
        <input
          id="lite-amount"
          aria-label="Amount in dollars"
          inputMode="decimal"
          placeholder="0"
          autoComplete="off"
          value={amount}
          onChange={(event) => onChange(sanitizeDecimal(event.target.value))}
          className="h-10 w-full rounded-[0.5rem] bg-panel-2 px-3 font-mono text-[0.875rem] text-ink outline-none dark:bg-panel-3 pl-7"
        />
      </div>
      <div className="grid grid-cols-4 gap-1">
        {presets.map((preset) => {
          const pressed = !preset.disabled && value > 0 && value === preset.value
          return (
            <button
              key={preset.label}
              type="button"
              disabled={preset.disabled}
              aria-pressed={pressed}
              onClick={() => onChange(String(preset.value))}
              className={cn(CHIP_CLASS, pressed ? "text-ink" : "text-ink-soft")}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
