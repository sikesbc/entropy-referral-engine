"use client"

import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { areaPath, monotonePath, niceTicks, type ChartPoint } from "@/lib/trade/chart-geometry"
import { TIME_LABEL_FORMAT, type ChartRange, type ChartType } from "@/lib/trade/chart-ranges"
import { seriesDomain, type ChartSeries } from "@/lib/trade/chart-series"
import { formatMarketPrice } from "@/lib/trade/price"
import { cn } from "@/lib/utils"

const PRICE_AXIS_WIDTH = 95
const PLOT_TOP = 17.5
const PLOT_BOTTOM_INSET = 37.5
const TIME_LABEL_INSET = 25
const CLIP_TOP = 15
const EDGE_FADE_WIDTH = 55
const PRICE_TICK_COUNT = 3
const TIME_DIVISIONS = 4
const CANDLE_BODY_RATIO = 0.6

const EDGE_FADE_STOPS = [
  { offset: "0", opacity: 0 },
  { offset: "0.25", opacity: 0 },
  { offset: "0.5", opacity: 0.28 },
  { offset: "0.75", opacity: 0.66 },
  { offset: "1", opacity: 1 },
]

const LABEL_CLASS =
  "pointer-events-none absolute font-mono text-[0.6875rem] tabular-nums tracking-[-0.02em] text-ink-quiet transition-opacity"

const WORDMARK_STYLE: CSSProperties = {
  mask: 'url("/entropy-wordmark.svg") center center / contain no-repeat',
}
const GRID_STYLE: CSSProperties = { stroke: "var(--color-ink)", opacity: 0.06 }
const UNDERLAY_STYLE: CSSProperties = { fill: "var(--color-panel)", fillOpacity: 0.5 }

type Size = { width: number; height: number }

type PriceChartProps = {
  series: ChartSeries | null
  decimals: number
  tone: "up" | "down"
  chartType: ChartType
  range: ChartRange
  intervalMs: number
}

function useElementSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size | null>(null)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((current) =>
        current && current.width === width && current.height === height ? current : { width, height },
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { ref, size }
}

export function PriceChart({ series, decimals, tone, chartType, range, intervalMs }: PriceChartProps) {
  const { ref, size } = useElementSize()

  return (
    <div className="relative min-h-0 flex-1 px-3 pt-2">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-14 z-0 h-[2.0625rem] w-[9.3125rem] bg-ink opacity-[0.08] sm:h-[4.125rem] sm:w-[18.5625rem]"
        style={WORDMARK_STYLE}
      />
      <div className="relative z-[1] h-full w-full">
        <div
          ref={ref}
          className="relative h-full w-full touch-pan-y select-none overflow-hidden"
          role="img"
          aria-label="Price chart"
        >
          {size && series ? (
            <ChartPlot
              size={size}
              series={series}
              decimals={decimals}
              tone={tone}
              chartType={chartType}
              range={range}
              intervalMs={intervalMs}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

type ChartPlotProps = Omit<PriceChartProps, "series"> & { size: Size; series: ChartSeries }

function ChartPlot({ size, series, decimals, tone, chartType, range, intervalMs }: ChartPlotProps) {
  const id = useId()
  const { width, height } = size
  const plotWidth = Math.max(0, width - PRICE_AXIS_WIDTH)
  const bottom = height - PLOT_BOTTOM_INSET
  const showCandles = chartType === "candle" && series.candles.length > 0
  const domain = seriesDomain(series, showCandles)
  const span = series.end - series.start

  const timeLabels = useMemo(() => {
    const format = new Intl.DateTimeFormat("en-US", TIME_LABEL_FORMAT[range])
    return Array.from({ length: TIME_DIVISIONS + 1 }, (_, index) => {
      const isEnd = index === TIME_DIVISIONS
      const time = series.start + (span * index) / TIME_DIVISIONS
      return {
        left: (plotWidth * index) / TIME_DIVISIONS,
        text: isEnd && range === "live" ? "now" : format.format(time),
        align: index === 0 ? "" : isEnd ? "-translate-x-full" : "-translate-x-1/2",
      }
    })
  }, [range, series.start, span, plotWidth])

  if (!domain || plotWidth <= 0 || span <= 0) return null

  const toX = (time: number) => ((time - series.start) / span) * plotWidth
  const toY = (price: number) => {
    const y = PLOT_TOP + ((domain.max - price) / (domain.max - domain.min)) * (bottom - PLOT_TOP)
    return Math.min(bottom, Math.max(PLOT_TOP, y))
  }
  const points: ChartPoint[] = series.points.map((point) => ({ x: toX(point.t), y: toY(point.p) }))
  const line = monotonePath(points)
  const area = areaPath(points, bottom)
  const ticks = niceTicks(domain.min, domain.max, PRICE_TICK_COUNT)
  const color = tone === "up" ? "var(--color-up)" : "var(--color-down)"
  const candleWidth = Math.max(1, (intervalMs / span) * plotWidth * CANDLE_BODY_RATIO)

  return (
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
            y1={PLOT_TOP}
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
            x2={EDGE_FADE_WIDTH}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            {EDGE_FADE_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor="#fff" stopOpacity={stop.opacity} />
            ))}
          </linearGradient>
          <mask id={`${id}-edge-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
            <rect x="0" y="0" width={width} height={height} fill={`url(#${id}-edge)`} />
          </mask>
          <clipPath id={`${id}-plot`}>
            <rect x="-2.5" y={CLIP_TOP} width={plotWidth + 2.5} height={height - CLIP_TOP} />
          </clipPath>
        </defs>
        {ticks.map((tick) => (
          <line
            key={tick}
            x1="0"
            x2={plotWidth}
            y1={toY(tick)}
            y2={toY(tick)}
            strokeWidth="1"
            strokeDasharray="2.5 6.25"
            style={GRID_STYLE}
          />
        ))}
        <g clipPath={`url(#${id}-plot)`} mask={`url(#${id}-edge-mask)`}>
          {showCandles ? (
            series.candles.map((bar) => {
              const x = toX(bar.t + intervalMs / 2)
              const top = toY(Math.max(bar.o, bar.c))
              const barColor = bar.c >= bar.o ? "var(--color-up)" : "var(--color-down)"
              return (
                <g key={bar.t} style={{ color: barColor }}>
                  <line x1={x} x2={x} y1={toY(bar.h)} y2={toY(bar.l)} stroke="currentColor" strokeWidth="1" />
                  <rect
                    x={x - candleWidth / 2}
                    y={top}
                    width={candleWidth}
                    height={Math.max(1, toY(Math.min(bar.o, bar.c)) - top)}
                    fill="currentColor"
                  />
                </g>
              )
            })
          ) : (
            <>
              <path d={area} style={UNDERLAY_STYLE} />
              <path d={area} fill={`url(#${id}-fill)`} />
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.16"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </g>
      </svg>
      {ticks.map((tick) => (
        <span
          key={tick}
          className={cn(LABEL_CLASS, "right-2.5 -translate-y-1/2")}
          style={{ top: `${toY(tick)}px` }}
        >
          {formatMarketPrice(tick, decimals)}
        </span>
      ))}
      {timeLabels.map((label) => (
        <span
          key={label.left}
          className={cn(LABEL_CLASS, "whitespace-nowrap", label.align)}
          style={{ left: `${label.left}px`, top: `${height - TIME_LABEL_INSET}px` }}
        >
          {label.text}
        </span>
      ))}
    </>
  )
}
