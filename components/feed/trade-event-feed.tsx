"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { FeedEmptyState } from "./feed-empty-state"
import { FeedViewHeader } from "./feed-view-header"
import { ShowMoreButton } from "./show-more-button"
import { SkeletonList } from "./skeleton-list"
import { TradeEventCard } from "./trade-event-card"
import type { TopTradeEvent } from "@/lib/api/types/discovery"
import type { Market } from "@/lib/api/types/markets"
import type { FeedTrader, MarketMap } from "@/lib/feed/trade-event"
import { useNow } from "@/lib/runtime/runtime-context"
import { cn } from "@/lib/utils"

const CHART_PRELOAD_AHEAD = 5
const REVEAL_TIMEOUT_MS = 4000
const LOADING_CARDS = 5

export type TradeEventFeedProps = {
  title: string
  events: TopTradeEvent[]
  traderFor: (address: string) => FeedTrader
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  markets: MarketMap
  selectedAddress: string | null
  joinedKeys: Set<string>
  onSelectTrader: (trader: FeedTrader) => void
  onCopy: (event: TopTradeEvent, market: Market, trader: FeedTrader) => void
}

function LoadingCards() {
  return (
    <SkeletonList
      label="Loading trades"
      count={LOADING_CARDS}
      className="gap-2.5"
      itemClassName="h-[10.5rem] rounded-[0.875rem]"
    />
  )
}

export function TradeEventFeed({
  title,
  events,
  traderFor,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingMore,
  onLoadMore,
  markets,
  selectedAddress,
  joinedKeys,
  onSelectTrader,
  onCopy,
}: TradeEventFeedProps) {
  const now = useNow()
  const listRef = useRef<HTMLDivElement>(null)
  const [maxVisibleIndex, setMaxVisibleIndex] = useState(-1)
  const [readyKeys, setReadyKeys] = useState<Set<string>>(() => new Set())
  const [gateKeys, setGateKeys] = useState<string[] | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const chartLimit = maxVisibleIndex < 0 ? -1 : maxVisibleIndex + CHART_PRELOAD_AHEAD

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => Number((entry.target as HTMLElement).dataset.feedIndex))
      if (visible.length) setMaxVisibleIndex((previous) => Math.max(previous, ...visible))
    })
    for (const child of Array.from(list.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [events.length, isLoading])

  const pendingGate =
    gateKeys === null && chartLimit >= 0 ? events.slice(0, chartLimit + 1).map((e) => e.key) : null
  if (pendingGate) setGateKeys(pendingGate)

  const allReady = gateKeys !== null && gateKeys.every((key) => readyKeys.has(key))
  const isRevealed = timedOut || allReady

  useEffect(() => {
    if (isRevealed || gateKeys === null) return
    const timer = window.setTimeout(() => setTimedOut(true), REVEAL_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [isRevealed, gateKeys])

  const handleChartReady = useCallback((key: string) => {
    setReadyKeys((previous) => (previous.has(key) ? previous : new Set(previous).add(key)))
  }, [])

  return (
    <>
      <FeedViewHeader title={title} />
      {isError && !events.length ? (
        <FeedEmptyState text="Couldn’t load trades." action={{ label: "Try again", onClick: onRetry }} />
      ) : isLoading ? (
        <LoadingCards />
      ) : events.length ? (
        <div className={cn("relative", !isRevealed && "max-h-[100vh] overflow-hidden")}>
          {!isRevealed ? (
            <div className="absolute inset-x-0 top-0 z-10">
              <LoadingCards />
            </div>
          ) : null}
          <div
            ref={listRef}
            aria-hidden={!isRevealed || undefined}
            className={cn("flex flex-col border-t border-line-soft pt-1.5", !isRevealed && "invisible")}
          >
            {events.map((event, index) => {
              const trader = traderFor(event.traderAddress)
              return (
                <TradeEventCard
                  key={event.key}
                  index={index}
                  event={event}
                  trader={trader}
                  market={markets.get(event.symbol) ?? null}
                  mark={null}
                  now={now}
                  isChartLoadAllowed={index <= chartLimit}
                  isSelected={event.traderAddress.toLowerCase() === selectedAddress}
                  isJoined={joinedKeys.has(event.key)}
                  onChartReady={handleChartReady}
                  onSelect={onSelectTrader}
                  onCopy={(copied, market) => onCopy(copied, market, trader)}
                />
              )
            })}
          </div>
          {isRevealed && hasMore ? <ShowMoreButton isLoading={isLoadingMore} onClick={onLoadMore} /> : null}
        </div>
      ) : (
        <FeedEmptyState text="No trades from these traders in the last 24 hours." />
      )}
    </>
  )
}
