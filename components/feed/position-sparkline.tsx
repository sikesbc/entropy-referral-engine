"use client"

import { useId, useLayoutEffect, useRef, useState } from "react"
import { useSparklineSeries } from "@/lib/api/social"
import {
  SPARKLINE_LABEL_OVERLAP_SLOP,
  labelPosition,
  projectPoints,
  smoothPath,
  type ChartPoint,
  type PricePoint,
} from "@/lib/feed/sparkline"
import { useNow } from "@/lib/runtime/runtime-context"
import { cn } from "@/lib/utils"

const DAY_MS = 86_400_000
const LABEL_CLASS =
  "pointer-events-none absolute whitespace-nowrap rounded-[0.375rem] bg-panel-2 px-1.5 py-0.5 dark:bg-panel-3 font-mono text-[0.6875rem] tabular-nums"

type Size = { width: number; height: number }
type Rect = { left: number; top: number; width: number; height: number }

function overlaps(a: Rect, b: Rect): boolean {
  const slop = SPARKLINE_LABEL_OVERLAP_SLOP
  return (
    a.left < b.left + b.width + slop &&
    b.left < a.left + a.width + slop &&
    a.top < b.top + b.height + slop &&
    b.top < a.top + a.height + slop
  )
}

function sameSize(a: Size | null, b: Size | null): boolean {
  return a === b || (a !== null && b !== null && a.width === b.width && a.height === b.height)
}

function labelRect(anchor: ChartPoint, size: Size, chart: Size, isAbove: boolean): Rect {
  return { ...labelPosition(anchor, size, chart, isAbove), ...size }
}

export function PositionSparkline({
  coin,
  openedAt,
  startHint,
  closedAt,
  entryPrice,
  endPrice,
  pnl,
  width,
  height,
  minSpanMs,
  isLoadAllowed,
  formatPrice,
  onReady,
}: {
  coin: string
  openedAt: number | null
  startHint: number | null
  closedAt: number | null
  entryPrice: number | null
  endPrice: number | null
  pnl: number | null
  width: number
  height: number
  minSpanMs: number
  isLoadAllowed: boolean
  formatPrice: (price: number) => string
  onReady: () => void
}) {
  const isOpen = closedAt == null
  const now = useNow(60_000)
  const gradientId = useId()
  const entryLabelRef = useRef<HTMLSpanElement>(null)
  const endLabelRef = useRef<HTMLSpanElement>(null)
  const [entryLabelSize, setEntryLabelSize] = useState<Size | null>(null)
  const [endLabelSize, setEndLabelSize] = useState<Size | null>(null)

  const end = closedAt ?? now
  const start = Math.min(openedAt ?? startHint ?? now - DAY_MS, end - minSpanMs)
  const series = useSparklineSeries({
    coin,
    windowId: `sparkline:${openedAt ?? "day"}:${closedAt ?? "open"}`,
    from: start,
    to: end,
    isOpen,
    now,
    enabled: isLoadAllowed,
  })
  const isReady = isLoadAllowed && !series.isPending

  const onReadyRef = useRef(onReady)
  useLayoutEffect(() => {
    onReadyRef.current = onReady
  })
  useLayoutEffect(() => {
    if (isReady) onReadyRef.current()
  }, [isReady])

  const entry: PricePoint | null =
    openedAt != null && entryPrice != null ? { time: openedAt, price: entryPrice } : null
  const ordered: PricePoint[] = [
    ...series.points.filter((point) => point.time >= start && point.time < end && point.time !== entry?.time),
    ...(entry ? [entry] : []),
    ...(endPrice == null ? [] : [{ time: end, price: endPrice }]),
  ].sort((a, b) => a.time - b.time)

  const entryText = entry ? formatPrice(entry.price) : null
  const endText = ordered.length ? formatPrice(ordered[ordered.length - 1].price) : null

  useLayoutEffect(() => {
    const measure = () => {
      const entryNode = entryLabelRef.current
      const endNode = endLabelRef.current
      const nextEntry = entryNode ? { width: entryNode.offsetWidth, height: entryNode.offsetHeight } : null
      const nextEnd = endNode ? { width: endNode.offsetWidth, height: endNode.offsetHeight } : null
      setEntryLabelSize((previous) => (sameSize(previous, nextEntry) ? previous : nextEntry))
      setEndLabelSize((previous) => (sameSize(previous, nextEnd) ? previous : nextEnd))
    }
    measure()
  }, [entryText, endText, series.isPending])

  if (series.isPending || ordered.length < 2) {
    return <div aria-hidden="true" style={{ width, height }} />
  }

  const chart = { width, height }
  const points = projectPoints(ordered, width, height, { flushLeft: true, flushRight: false })
  const path = smoothPath(points)
  const first = points[0]
  const last = points[points.length - 1]
  const entryPoint = entry ? (points[ordered.indexOf(entry)] ?? first) : null
  const color = pnl != null && pnl < 0 ? "var(--color-down)" : "var(--color-up)"

  const defaultEndAbove = last.y > height / 2
  const defaultEntryAbove = entryPoint != null && entryPoint.y > height / 2
  const hasOverlap =
    entryPoint != null &&
    entryLabelSize != null &&
    endLabelSize != null &&
    overlaps(
      labelRect(entryPoint, entryLabelSize, chart, defaultEntryAbove),
      labelRect(last, endLabelSize, chart, defaultEndAbove),
    )
  const endAbove = hasOverlap && entryPoint ? last.y <= entryPoint.y : defaultEndAbove
  const entryAbove = hasOverlap ? !endAbove : defaultEntryAbove
  const entryLabel =
    entryPoint && entryLabelSize ? labelPosition(entryPoint, entryLabelSize, chart, entryAbove) : null
  const endLabel = endLabelSize ? labelPosition(last, endLabelSize, chart, endAbove) : null

  return (
    <div aria-hidden="true" className="relative" style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: color, stopOpacity: 0.2 }} />
            <stop offset="1" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path
          d={`${path} L${last.x.toFixed(2)},${height} L${first.x.toFixed(2)},${height} Z`}
          fill={`url(#${gradientId})`}
        />
        <path
          d={path}
          fill="none"
          style={{ stroke: color }}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {entryPoint ? <circle cx={entryPoint.x} cy={entryPoint.y} r={3.5} style={{ fill: color }} /> : null}
        {isOpen ? (
          <circle className="simple-chart-pulse" cx={last.x} cy={last.y} r={4} style={{ fill: color }} />
        ) : null}
        <circle cx={last.x} cy={last.y} r={4} style={{ fill: color }} />
      </svg>
      {entryPoint && entryText ? (
        <span
          ref={entryLabelRef}
          className={cn(LABEL_CLASS, "text-ink-soft")}
          style={{
            left: entryLabel?.left ?? 0,
            top: entryLabel?.top ?? 0,
            visibility: entryLabel ? undefined : "hidden",
          }}
        >
          {entryText}
        </span>
      ) : null}
      <span
        ref={endLabelRef}
        className={cn(LABEL_CLASS, pnl == null ? "text-ink-soft" : pnl < 0 ? "text-down" : "text-up")}
        style={{
          left: endLabel?.left ?? 0,
          top: endLabel?.top ?? 0,
          visibility: endLabel ? undefined : "hidden",
        }}
      >
        {endText}
      </span>
    </div>
  )
}
