"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DiscoverNav } from "./discover-nav"
import { FollowButton } from "./follow-button"
import { FollowingSegment } from "./following-segment"
import { LeaderboardSegment } from "./leaderboard-segment"
import type { LeaderboardSortColumn, SortDirection } from "./leaderboard-model"
import { TopTradersAside } from "./top-traders-aside"
import { TradeEventsSegment } from "./trade-events-segment"
import { useFollowing } from "@/lib/api/account"
import { useMarketMap } from "@/lib/api/social"
import type { TopTradeEvent } from "@/lib/api/types/discovery"
import type { Market } from "@/lib/api/types/markets"
import { marketTradePath, type FeedTrader } from "@/lib/feed/trade-event"
import { DEFAULT_SOCIAL_VIEW, FEED_VIEWS, LEADERBOARD_VIEWS, type SocialView } from "@/lib/feed/views"

export function SocialFeed() {
  const router = useRouter()
  const markets = useMarketMap()
  const following = useFollowing()
  const [view, setView] = useState<SocialView>(DEFAULT_SOCIAL_VIEW)
  const [sortColumn, setSortColumn] = useState<LeaderboardSortColumn>("rank")
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending")
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const joinedKeys = useMemo(() => new Set<string>(), [])

  const followedAddresses = useMemo(
    () => new Set((following.data?.items ?? []).map((wallet) => wallet.address.toLowerCase())),
    [following.data],
  )

  const followAction = useCallback(
    (trader: FeedTrader, className?: string) =>
      trader.id && following.data ? (
        <FollowButton isFollowing={followedAddresses.has(trader.address)} className={className} />
      ) : null,
    [following.data, followedAddresses],
  )

  const selectTrader = useCallback((trader: FeedTrader) => {
    setSelectedAddress((current) => (current === trader.address ? null : trader.address))
  }, [])

  const copyTrade = useCallback(
    (_event: TopTradeEvent, market: Market) => router.push(marketTradePath(market)),
    [router],
  )

  const sort = (column: LeaderboardSortColumn) => {
    if (column === sortColumn) {
      setSortDirection((current) => (current === "ascending" ? "descending" : "ascending"))
      return
    }
    setSortColumn(column)
    setSortDirection(column === "rank" ? "ascending" : "descending")
  }

  const shared = {
    markets,
    selectedAddress,
    joinedKeys,
    onSelectTrader: selectTrader,
    onCopy: copyTrade,
  }

  return (
    <main className="flex flex-1 flex-col gap-[0.1875rem] px-[0.1875rem] pb-[0.1875rem] lg:grid lg:min-h-0 lg:grid-cols-[14rem_minmax(0,1fr)_24rem] lg:grid-rows-[minmax(0,1fr)]">
      <DiscoverNav view={view} onChange={setView} />
      <section
        aria-label="Social"
        className="entropy-card rounded-[0.625rem] flex min-w-0 flex-col gap-3 p-4 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:none]"
      >
        {view.kind === "leaderboard" ? (
          <LeaderboardSegment
            key={view.segment}
            view={LEADERBOARD_VIEWS[view.segment]}
            markets={markets}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={sort}
            selectedAddress={selectedAddress}
            onSelect={selectTrader}
            followAction={followAction}
          />
        ) : view.segment === "following" ? (
          <FollowingSegment
            key={view.segment}
            title={FEED_VIEWS.following.title}
            onBrowseTraders={() => setView({ kind: "leaderboard", segment: "top_this_month" })}
            {...shared}
          />
        ) : (
          <TradeEventsSegment
            key={view.segment}
            title={FEED_VIEWS[view.segment].title}
            feed={FEED_VIEWS[view.segment].feed}
            {...shared}
          />
        )}
      </section>
      <TopTradersAside markets={markets} onSelectTrader={selectTrader} />
    </main>
  )
}
