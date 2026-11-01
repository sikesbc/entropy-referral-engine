"use client"

import { useLayoutEffect, useState, type RefObject } from "react"

export type MeasuredBox = { left: number; top: number; width: number; height: number }

function sameBox(a: MeasuredBox | null, b: MeasuredBox | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height
}

export function useMeasuredBox(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  key: unknown,
): MeasuredBox | null {
  const [box, setBox] = useState<MeasuredBox | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => {
      const target = container.querySelector<HTMLElement>(selector)
      const next = target
        ? {
            left: target.offsetLeft,
            top: target.offsetTop,
            width: target.offsetWidth,
            height: target.offsetHeight,
          }
        : null
      setBox((previous) => (sameBox(previous, next) ? previous : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef, selector, key])

  return box
}
