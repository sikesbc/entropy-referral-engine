"use client"

import { useMemo } from "react"
import { TradeEventFeed, type TradeEventFeedProps } from "./trade-event-feed"
import { useTopTradeEventsFeed, useWalletIdentityMap } from "@/lib/api/social"
import { filterFeedEvents, uniqueByKey } from "@/lib/feed/trade-event"
import type { TradeEventFeedKind } from "@/lib/feed/views"

type SharedFeedProps = Omit<
  TradeEventFeedProps,
  | "title"
  | "events"
  | "traderFor"
  | "isLoading"
  | "isError"
  | "onRetry"
  | "hasMore"
  | "isLoadingMore"
  | "onLoadMore"
>

export function TradeEventsSegment({
  title,
  feed,
  ...shared
}: SharedFeedProps & { title: string; feed: TradeEventFeedKind }) {
  const query = useTopTradeEventsFeed(feed)
  const events = useMemo(
    () => filterFeedEvents(uniqueByKey(query.data?.pages.flatMap((page) => page.events) ?? []), feed),
    [query.data, feed],
  )
  const addresses = useMemo(() => [...new Set(events.map((event) => event.traderAddress))], [events])
  const { traderFor } = useWalletIdentityMap(addresses)
  return (
    <TradeEventFeed
      title={title}
      events={events}
      traderFor={traderFor}
      isLoading={query.isPending}
      isError={query.isError}
      onRetry={() => void query.refetch()}
      hasMore={query.hasNextPage}
      isLoadingMore={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      {...shared}
    />
  )
}
