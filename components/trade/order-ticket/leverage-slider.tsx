"use client"

import { useRef, type KeyboardEvent, type PointerEvent } from "react"
import type { OrderSide } from "@/lib/api/types/orders"
import { cn } from "@/lib/utils"
import { leverageRatio, leverageTicks } from "./ticket-math"

type LeverageSliderProps = {
  leverage: number
  maxLeverage: number
  side: OrderSide
  onChange: (leverage: number) => void
}

const THUMB_HALF_PX = 20

function percent(ratio: number): string {
  return `${Number((ratio * 100).toFixed(4))}%`
}

function thumbLeft(ratio: number): string {
  return `calc(${percent(ratio)} + ${THUMB_HALF_PX * (1 - 2 * ratio)}px)`
}

function fillWidth(ratio: number): string {
  return `calc(${percent(ratio)} + ${Number((2 * (1 - ratio)).toFixed(4))}rem)`
}

function tickLabelLeft(ratio: number): string {
  return `calc(${percent(ratio)} + ${Number((1.3125 - 2.625 * ratio).toFixed(4))}rem)`
}

export function LeverageSlider({ leverage, maxLeverage, side, onChange }: LeverageSliderProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const ratio = leverageRatio(leverage, maxLeverage)
  const ticks = leverageTicks(maxLeverage)
  const innerTicks = ticks.filter((tick) => tick > 1 && tick < maxLeverage)

  const clamp = (value: number) => Math.min(maxLeverage, Math.max(1, Math.round(value)))

  const valueAt = (clientX: number) => {
    const root = rootRef.current
    if (!root) return leverage
    const rect = root.getBoundingClientRect()
    const usable = rect.width - THUMB_HALF_PX * 2
    if (usable <= 0) return leverage
    const position = Math.min(1, Math.max(0, (clientX - rect.left - THUMB_HALF_PX) / usable))
    return clamp(1 + position * (maxLeverage - 1))
  }

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    onChange(valueAt(event.clientX))
  }

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    onChange(valueAt(event.clientX))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: leverage - 1,
      ArrowDown: leverage - 1,
      ArrowRight: leverage + 1,
      ArrowUp: leverage + 1,
      PageDown: leverage - 5,
      PageUp: leverage + 5,
      Home: 1,
      End: maxLeverage,
    }
    const next = steps[event.key]
    if (next === undefined) return
    event.preventDefault()
    onChange(clamp(next))
  }

  return (
    <div className="-mb-[0.1rem]">
      <div className="relative pb-5">
        <div className="rounded-[0.75rem] bg-panel-2 p-[0.3125rem] dark:bg-panel-3">
          <span
            ref={rootRef}
            dir="ltr"
            data-orientation="horizontal"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            className="group relative flex h-8 w-full touch-none select-none items-center"
          >
            <span
              data-orientation="horizontal"
              className="relative h-full w-full overflow-hidden rounded-[0.5rem] bg-ink/[0.04] dark:bg-white/[0.04]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-[0.5rem] opacity-85"
                style={{
                  width: fillWidth(ratio),
                  backgroundColor: side === "long" ? "var(--color-up)" : "var(--color-down)",
                }}
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 right-4">
                {innerTicks.map((tick) => (
                  <span
                    key={tick}
                    className="absolute top-1/2 h-2 w-[0.0938rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/25"
                    style={{ left: percent(leverageRatio(tick, maxLeverage)) }}
                  />
                ))}
              </span>
            </span>
            <span className="absolute -translate-x-1/2" style={{ left: thumbLeft(ratio) }}>
              <span
                role="slider"
                aria-label="Leverage"
                aria-valuemin={1}
                aria-valuemax={maxLeverage}
                aria-valuenow={leverage}
                aria-orientation="horizontal"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="lite-light-pill relative flex size-8 items-center justify-center rounded-[0.5rem]"
              >
                <span className="pointer-events-none font-mono text-[0.75rem] font-semibold leading-none">
                  {leverage}×
                </span>
              </span>
            </span>
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4">
          {ticks.map((tick) => (
            <button
              key={tick}
              type="button"
              tabIndex={-1}
              onClick={() => onChange(tick)}
              className={cn(
                "absolute -translate-x-1/2 cursor-pointer font-mono text-[0.6875rem] outline-none transition-colors hover:text-ink",
                tick === leverage ? "text-ink-soft" : "text-ink-quiet",
              )}
              style={{ left: tickLabelLeft(leverageRatio(tick, maxLeverage)) }}
            >
              {tick}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
