"use client"

import { useId } from "react"
import { sparklinePaths } from "@/lib/markets/sparkline"
import { useDaySparkline } from "@/lib/markets/use-day-sparkline"

export function SparklineChart({
  coin,
  up,
  endPrice,
  width,
  height,
}: {
  coin: string
  up: boolean
  endPrice: number | null
  width: number
  height: number
}) {
  const gradientId = useId()
  const { points, isPending } = useDaySparkline(coin, endPrice)
  const paths = isPending ? null : sparklinePaths(points, width, height)
  if (!paths) return <div aria-hidden="true" style={{ width, height }} />
  const color = up ? "var(--color-up)" : "var(--color-down)"

  return (
    <div aria-hidden="true" className="relative" style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: color, stopOpacity: 0.2 }} />
            <stop offset="1" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path d={paths.area} fill={`url(#${gradientId})`} />
        <path
          d={paths.line}
          fill="none"
          style={{ stroke: color }}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
