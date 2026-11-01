"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { PositionSparkline } from "./position-sparkline"
import type { Market } from "@/lib/api/types/markets"
import { formatMarketPrice } from "@/lib/feed/format"
import type { PositionSpan } from "@/lib/feed/trade-event"

const MIN_SPAN_MS = 3_600_000

export function TradeEventChart({
  span,
  market,
  mark,
  pnlUsd,
  isLoadAllowed,
  onReady,
}: {
  span: PositionSpan
  market: Market | null
  mark: number | null
  pnlUsd: number | null
  isLoadAllowed: boolean
  onReady: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      const next = { width: element.clientWidth, height: element.clientHeight }
      setSize((previous) =>
        previous && previous.width === next.width && previous.height === next.height ? previous : next,
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const szDecimals = market?.szDecimals ?? null
  return (
    <div className="relative min-w-[15rem] overflow-hidden rounded-[0.625rem] bg-panel pt-2.5 -my-2.5 -mr-2.5 h-auto min-h-36 flex-[13_1_0%]">
      <div ref={ref} className="relative size-full">
        {isLoadAllowed && size && size.width > 0 ? (
          <PositionSparkline
            coin={span.symbol}
            openedAt={span.entryTime}
            startHint={span.startTime}
            closedAt={span.exit?.time ?? null}
            entryPrice={span.entryPrice}
            endPrice={span.exit?.price ?? mark}
            pnl={pnlUsd}
            width={size.width}
            height={size.height}
            minSpanMs={MIN_SPAN_MS}
            isLoadAllowed={isLoadAllowed}
            formatPrice={(price) => formatMarketPrice(price, szDecimals)}
            onReady={onReady}
          />
        ) : null}
      </div>
    </div>
  )
}
