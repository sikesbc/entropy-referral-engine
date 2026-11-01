"use client"

import { useMemo } from "react"
import { FeedEmptyState } from "./feed-empty-state"
import { TradeEventFeed, type TradeEventFeedProps } from "./trade-event-feed"
import { useFollowing } from "@/lib/api/account"
import { useTopTradeEventsFeed, useWalletIdentityMap } from "@/lib/api/social"
import { uniqueByKey } from "@/lib/feed/trade-event"

const FOLLOWING_LIMIT = 10

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

export function FollowingSegment({
  title,
  onBrowseTraders,
  ...shared
}: SharedFeedProps & { title: string; onBrowseTraders: () => void }) {
  const following = useFollowing()
  const followed = useMemo(
    () =>
      (following.data?.items ?? []).slice(0, FOLLOWING_LIMIT).map((wallet) => wallet.address.toLowerCase()),
    [following.data],
  )
  const hasFollowed = followed.length > 0
  const feed = useTopTradeEventsFeed("all", hasFollowed)
  const events = useMemo(() => {
    const wanted = new Set(followed)
    return uniqueByKey(feed.data?.pages.flatMap((page) => page.events) ?? [])
      .filter((event) => wanted.has(event.traderAddress.toLowerCase()))
      .sort((a, b) => b.endedAt - a.endedAt)
  }, [feed.data, followed])
  const { traderFor } = useWalletIdentityMap(followed)

  if (following.isError) {
    return (
      <FeedEmptyState
        text="Couldn’t load who you follow."
        action={{ label: "Try again", onClick: () => void following.refetch() }}
      />
    )
  }
  if (following.data && !hasFollowed) {
    return (
      <FeedEmptyState
        title="Nothing here yet"
        text="You’re not following anyone yet. Follow traders from the leaderboard to see their trades here."
        action={{ label: "Browse top traders", onClick: onBrowseTraders }}
      />
    )
  }
  return (
    <TradeEventFeed
      title={title}
      events={events}
      traderFor={traderFor}
      isLoading={following.isPending || (hasFollowed && feed.isPending)}
      isError={feed.isError}
      onRetry={() => void feed.refetch()}
      hasMore={false}
      isLoadingMore={false}
      onLoadMore={() => {}}
      {...shared}
    />
  )
}
