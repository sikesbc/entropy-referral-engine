"use client"

import { Check, Info } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useMultiplierHint } from "./use-multiplier-hint"

type MultiplierFieldProps = {
  marketName: string
  leverage: number
  maxLeverage: number | null
  suppressHint: boolean
  children: ReactNode
}

export function MultiplierField({
  marketName,
  leverage,
  maxLeverage,
  suppressHint,
  children,
}: MultiplierFieldProps) {
  const { dismissed, dismiss } = useMultiplierHint()
  const [open, setOpen] = useState(false)
  const coachmark = !dismissed && !suppressHint && maxLeverage !== null
  const points = [
    "Your wins and losses are amplified.",
    `At ${leverage}×, a 1% ${marketName} move feels like ${leverage}%.`,
    "Your multiplier affects your auto-close price.",
  ]

  const handleOpenChange = (next: boolean) => {
    if (!next && coachmark) dismiss()
    setOpen(next)
  }

  return (
    <div data-tour="multiplier" className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[0.8125rem] text-ink-quiet">
        Multiplier
        <Popover open={open || coachmark} onOpenChange={handleOpenChange}>
          <PopoverTrigger
            openOnHover={!coachmark}
            delay={150}
            aria-label="About the multiplier"
            className="-my-1 flex size-5 items-center justify-center rounded-full text-ink-quiet transition-colors hover:text-ink data-[popup-open]:text-ink"
          >
            <Info size="0.875rem" aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="start"
            sideOffset={12}
            initialFocus={false}
            className="entropy-trade-scope flex w-[17rem] flex-col gap-2.5 rounded-[0.625rem] border border-line-soft bg-panel p-3 text-base text-ink shadow-xl outline-none ring-0"
          >
            <h2 className="text-[0.875rem] font-semibold">Multiplier up to {maxLeverage}×</h2>
            <ul className="flex flex-col gap-2">
              {points.map((point) => (
                <li key={point} className="flex gap-2 text-[0.8125rem] text-ink-soft">
                  <Check size={14} aria-hidden="true" className="mt-[0.2rem] shrink-0 text-up" />
                  {point}
                </li>
              ))}
            </ul>
            {coachmark ? (
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="lite-raised-orange inline-flex h-8 items-center justify-center self-end rounded-[0.4375rem] px-4 text-[0.8125rem]"
              >
                Got it
              </button>
            ) : null}
          </PopoverContent>
        </Popover>
      </span>
      {children}
    </div>
  )
}
