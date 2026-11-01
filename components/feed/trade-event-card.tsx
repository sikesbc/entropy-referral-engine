"use client"

import { useMemo } from "react"
import { Check } from "lucide-react"
import { AssetSummary } from "./asset-summary"
import { ChangeBadge } from "./change-badge"
import { SignedUsd } from "./signed-usd"
import { TradeEventChart } from "./trade-event-chart"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import type { TopTradeEvent } from "@/lib/api/types/discovery"
import type { Market } from "@/lib/api/types/markets"
import { formatAgo, formatFeedUsd, formatHeld } from "@/lib/feed/format"
import {
  isClosedEvent,
  marketDisplayName,
  positionSpan,
  tradeEventResult,
  type FeedTrader,
} from "@/lib/feed/trade-event"
import { cn } from "@/lib/utils"

function resultCaption(event: TopTradeEvent): string {
  if (isClosedEvent(event)) {
    return event.openedAt == null
      ? "Realized"
      : `Realized · held ${formatHeld(event.endedAt - event.openedAt)}`
  }
  return event.isStillOpen ? "Unrealized" : "Marked to the current price"
}

export function TradeEventCard({
  index,
  event,
  trader,
  market,
  mark,
  now,
  isChartLoadAllowed,
  isSelected,
  isJoined,
  onChartReady,
  onSelect,
  onCopy,
}: {
  index: number
  event: TopTradeEvent
  trader: FeedTrader
  market: Market | null
  mark: number | null
  now: number
  isChartLoadAllowed: boolean
  isSelected: boolean
  isJoined: boolean
  onChartReady: (key: string) => void
  onSelect: (trader: FeedTrader) => void
  onCopy: (event: TopTradeEvent, market: Market) => void
}) {
  const closed = isClosedEvent(event)
  const span = useMemo(() => positionSpan(event), [event])
  const leverage = event.leverage ?? market?.maxLeverage ?? null
  const result = tradeEventResult(event, mark, leverage)
  const name = marketDisplayName(event.symbol, market)

  return (
    <article
      data-feed-index={index}
      onClick={() => onSelect(trader)}
      aria-current={isSelected || undefined}
      className="group flex cursor-pointer flex-col gap-3 py-4"
    >
      <header className="flex items-center gap-3">
        <WalletAvatar
          seed={trader.address}
          src={trader.avatarUrl}
          size="2.25rem"
          className="shrink-0 rounded-full"
        />
        <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="truncate text-[0.9375rem] font-semibold text-ink">{trader.name}</span>
          {event.traderRank != null ? (
            <span className="rounded-[0.375rem] bg-panel-2 px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink-soft dark:bg-panel-3">
              #{event.traderRank} this month
            </span>
          ) : null}
          <span className="text-[0.8125rem] text-ink-ghost">{formatAgo(event.endedAt, now)}</span>
        </span>
        {isJoined ? (
          <span title="Joined" className="inline-flex size-7 shrink-0 items-center justify-center text-up">
            <Check size="0.875rem" aria-label="Joined" />
          </span>
        ) : !closed && market ? (
          <button
            type="button"
            title={`Copy ${event.side} ${name}`}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation()
              onCopy(event, market)
            }}
            className="h-7 shrink-0 rounded-[0.4375rem] bg-panel-2 px-2.5 text-[0.75rem] font-medium text-ink transition-shadow hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.05)] focus-visible:outline-2 focus-visible:outline-line dark:bg-panel-3 dark:hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.18)]"
          >
            Copy
          </button>
        ) : null}
      </header>
      <div
        className={cn(
          "flex flex-wrap items-stretch gap-x-7 gap-y-4 rounded-[0.875rem] bg-panel-2 p-4 ring-1 ring-transparent transition-shadow group-hover:ring-line sm:ml-12 dark:bg-panel-3",
          isSelected && "ring-ink/30 group-hover:ring-ink/30",
        )}
      >
        <div className="flex min-w-[13rem] flex-[7_1_0%] flex-col justify-between gap-4">
          <AssetSummary
            symbol={event.symbol}
            side={event.side}
            leverage={event.leverage}
            market={market}
            title={`${closed ? "Closed" : "Opened"} ${name}`}
            detail={formatFeedUsd(event.sizeUsd)}
          />
          <div className="flex flex-col gap-1">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[1.5rem] leading-none tabular-nums tracking-[-0.04em]">
                <SignedUsd value={result.pnlUsd} />
              </span>
              {result.returnFraction != null ? (
                <ChangeBadge change={result.returnFraction} className="text-[0.75rem]" />
              ) : null}
            </span>
            <span className="text-[0.75rem] text-ink-quiet">{resultCaption(event)}</span>
          </div>
        </div>
        <TradeEventChart
          span={span}
          market={market}
          mark={mark}
          pnlUsd={result.pnlUsd}
          isLoadAllowed={isChartLoadAllowed}
          onReady={() => onChartReady(event.key)}
        />
      </div>
    </article>
  )
}
