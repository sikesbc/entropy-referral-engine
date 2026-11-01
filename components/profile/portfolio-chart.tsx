"use client"

import { useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react"
import { AXIS_TICK_COUNT, formatAxisTime } from "@/lib/profile/chart-axis"
import type { SeriesPoint } from "@/lib/profile/portfolio-history"

const PADDING = { top: 14, right: 12, bottom: 30, left: 0 }
const EDGE_STOPS = [1, 1, 0.72, 0.34, 0]
const EDGE_WIDTH = 44
const LINE_WIDTH = 2
const GLOW_WIDTH = 8
const DOT_RADIUS = 4.5
const AXIS_GAP = 10

type Size = { width: number; height: number; scale: number }

function useChartSize(ref: RefObject<HTMLDivElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0, scale: 1 })
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      const { width, height } = element.getBoundingClientRect()
      const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1
      setSize((previous) =>
        previous.width === width && previous.height === height && previous.scale === scale
          ? previous
          : { width, height, scale },
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return size
}

function buildGeometry(points: SeriesPoint[], size: Size) {
  const { width, height, scale } = size
  const left = PADDING.left * scale
  const right = width - PADDING.right * scale
  const top = PADDING.top * scale
  const bottom = height - PADDING.bottom * scale
  const first = points[0].t
  const last = points[points.length - 1].t
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const xOf = (t: number) => (last === first ? right : left + ((t - first) / (last - first)) * (right - left))
  const yOf = (value: number) =>
    max === min ? (top + bottom) / 2 : bottom - ((value - min) / (max - min)) * (bottom - top)
  const coords = points.map((point) => ({ x: xOf(point.t), y: yOf(point.value) }))
  const line = coords.map((c, index) => `${index === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ")
  const fill = `${line} L${coords[coords.length - 1].x} ${bottom} L${coords[0].x} ${bottom} Z`
  const span = last - first
  const ticks = Array.from({ length: AXIS_TICK_COUNT }, (_, index) => {
    const ratio = index / (AXIS_TICK_COUNT - 1)
    return { x: left + ratio * (right - left), time: first + ratio * span }
  })
  return { left, right, top, bottom, line, fill, end: coords[coords.length - 1], ticks, span }
}

export function PortfolioChart({
  points,
  color,
  ready,
  emptyText,
}: {
  points: SeriesPoint[]
  color: string
  ready: boolean
  emptyText: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const size = useChartSize(ref)
  const id = useId()
  const geometry = useMemo(
    () => (points.length > 0 && size.width > 0 ? buildGeometry(points, size) : null),
    [points, size],
  )
  const { width, height, scale } = size

  return (
    <div
      ref={ref}
      className="relative h-full w-full touch-pan-y select-none overflow-hidden "
      role="img"
      aria-label="Price chart"
    >
      {geometry ? (
        <>
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
            aria-hidden="true"
            style={{ color, transition: "color 500ms" }}
          >
            <defs>
              <linearGradient
                id={`${id}-fill`}
                x1="0"
                y1={geometry.top}
                x2="0"
                y2={height}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" style={{ stopColor: "currentColor", stopOpacity: 0.24 }} />
                <stop offset="1" style={{ stopColor: "currentColor", stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient
                id={`${id}-edge`}
                x1="0"
                y1="0"
                x2={EDGE_WIDTH * scale}
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                {EDGE_STOPS.map((stop, index) => (
                  <stop
                    key={index}
                    offset={index / (EDGE_STOPS.length - 1)}
                    stopColor="#fff"
                    stopOpacity={1 - stop}
                  />
                ))}
              </linearGradient>
              <mask
                id={`${id}-edge-mask`}
                maskUnits="userSpaceOnUse"
                x={0}
                y={0}
                width={width}
                height={height}
              >
                <rect x={0} y={0} width={width} height={height} fill={`url(#${id}-edge)`} />
              </mask>
              <clipPath id={`${id}-plot`}>
                <rect
                  x={geometry.left - LINE_WIDTH * scale}
                  y={geometry.top - LINE_WIDTH * scale}
                  width={geometry.right - geometry.left + LINE_WIDTH * scale}
                  height={height - geometry.top + LINE_WIDTH * scale}
                />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}-plot)`} mask={`url(#${id}-edge-mask)`}>
              <path d={geometry.fill} style={{ fill: "var(--color-panel)", fillOpacity: 0.5 }} />
              <path d={geometry.fill} fill={`url(#${id}-fill)`} />
              <path
                d={geometry.line}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.16}
                strokeWidth={GLOW_WIDTH * scale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={geometry.line}
                fill="none"
                stroke="currentColor"
                strokeWidth={LINE_WIDTH * scale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <circle
              className="simple-chart-pulse"
              cx={geometry.end.x}
              cy={geometry.end.y}
              r={DOT_RADIUS * scale}
              fill="currentColor"
            />
            <circle
              cx={geometry.end.x}
              cy={geometry.end.y}
              r={6 * scale}
              style={{ fill: "var(--color-panel)" }}
            />
            <circle cx={geometry.end.x} cy={geometry.end.y} r={DOT_RADIUS * scale} fill="currentColor" />
          </svg>
          {geometry.ticks.map((tick, index) => (
            <span
              key={index}
              className={`pointer-events-none absolute whitespace-nowrap font-mono text-[0.6875rem] tabular-nums tracking-[-0.02em] text-ink-quiet transition-opacity ${
                index === 0
                  ? ""
                  : index === geometry.ticks.length - 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2"
              } `}
              style={{ left: tick.x, top: geometry.bottom + AXIS_GAP * scale }}
            >
              {formatAxisTime(tick.time, geometry.span)}
            </span>
          ))}
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-[0.8125rem] text-ink-quiet">
          {ready && points.length === 0 ? emptyText : null}
        </div>
      )}
    </div>
  )
}
