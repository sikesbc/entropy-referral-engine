"use client"

import { useId, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react"
import type { EarningsPoint } from "./earnings-range"

const PADDING = { top: 8, right: 4, bottom: 8, left: 0 }

type Size = { width: number; height: number }

type Plot = {
  line: string
  fill: string
  coords: { x: number; y: number; point: EarningsPoint }[]
}

function buildPlot(input: EarningsPoint[], size: Size): Plot | null {
  if (input.length === 0 || size.width <= 0 || size.height <= 0) return null
  const points = input.length === 1 ? [input[0], { time: input[0].time + 1, value: input[0].value }] : input
  const times = points.map((point) => point.time)
  const values = points.map((point) => point.value)
  const minTime = Math.min(...times)
  const timeSpan = Math.max(...times) - minTime || 1
  const minValue = Math.min(...values)
  const valueSpan = Math.max(...values) - minValue || 1
  const innerWidth = size.width - PADDING.left - PADDING.right
  const innerHeight = size.height - PADDING.top - PADDING.bottom
  const coords = points.map((point) => ({
    x: PADDING.left + ((point.time - minTime) / timeSpan) * innerWidth,
    y: PADDING.top + (1 - (point.value - minValue) / valueSpan) * innerHeight,
    point,
  }))
  const line = coords.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ")
  const first = coords[0]
  const last = coords[coords.length - 1]
  return { line, fill: `${line} L${last.x},${size.height} L${first.x},${size.height} Z`, coords }
}

function nearest(plot: Plot, x: number) {
  return plot.coords.reduce((best, coord) => (Math.abs(coord.x - x) < Math.abs(best.x - x) ? coord : best))
}

export function EarningsChart({
  points,
  emptyText,
  onScrub,
  color = "var(--color-up)",
  label = "Price chart",
}: {
  points: EarningsPoint[]
  emptyText: string
  onScrub: (point: EarningsPoint | null) => void
  color?: string
  label?: string
}) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const [hoverX, setHoverX] = useState<number | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => setSize({ width: container.clientWidth, height: container.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const plot = useMemo(() => buildPlot(points, size), [points, size])
  const active = plot && hoverX !== null ? nearest(plot, hoverX) : null

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!plot) return
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left
    setHoverX(x)
    onScrub(nearest(plot, x).point)
  }

  const handleLeave = () => {
    setHoverX(null)
    onScrub(null)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-pan-y select-none overflow-hidden "
      role="img"
      aria-label={label}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {plot ? (
        <svg
          width={size.width}
          height={size.height}
          className="absolute inset-0"
          style={{ color }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`${id}-fill`}
              x1="0"
              y1={PADDING.top}
              x2="0"
              y2={size.height}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" style={{ stopColor: "currentColor", stopOpacity: 0.24 }} />
              <stop offset="1" style={{ stopColor: "currentColor", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={plot.fill} fill={`url(#${id}-fill)`} />
          <path
            d={plot.line}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {active ? (
            <>
              <line
                x1={active.x}
                x2={active.x}
                y1={0}
                y2={size.height}
                strokeWidth={1}
                strokeDasharray="2 5"
                style={{ stroke: "var(--color-ink)", opacity: 0.25 }}
              />
              <circle cx={active.x} cy={active.y} r={4} fill="currentColor" />
            </>
          ) : null}
        </svg>
      ) : (
        <div className="flex h-full items-center justify-center text-[0.8125rem] text-ink-quiet">
          {emptyText}
        </div>
      )}
    </div>
  )
}
