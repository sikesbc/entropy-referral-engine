"use client"

import { useRef, type KeyboardEvent, type PointerEvent } from "react"
import { cn } from "@/lib/utils"

const KEY_STEP = 16

type ResizeHandleProps = {
  label: string
  orientation: "horizontal" | "vertical"
  value: number
  min: number
  max: number
  invert?: boolean
  className?: string
  onChange: (value: number) => void
}

export function ResizeHandle({
  label,
  orientation,
  value,
  min,
  max,
  invert = false,
  className,
  onChange,
}: ResizeHandleProps) {
  const drag = useRef<{ origin: number; start: number } | null>(null)
  const clamp = (next: number) => Math.round(Math.min(max, Math.max(min, next)))
  const coordinate = (event: PointerEvent<HTMLDivElement>) =>
    orientation === "horizontal" ? event.clientY : event.clientX

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { origin: coordinate(event), start: value }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const delta = coordinate(event) - drag.current.origin
    onChange(clamp(drag.current.start + (invert ? -delta : delta)))
  }

  const onPointerUp = () => {
    drag.current = null
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = orientation === "horizontal" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"]
    const index = keys.indexOf(event.key)
    if (index < 0) return
    event.preventDefault()
    const direction = (index === 0 ? -1 : 1) * (invert ? -1 : 1)
    onChange(clamp(value + direction * KEY_STEP))
  }

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "hidden touch-none bg-transparent outline-none focus:outline-none focus-visible:outline-none lg:block",
        className,
      )}
    />
  )
}
