import type { TopTradersOrder, TopTradersWindow } from "@/lib/api/types/discovery"

export type LeaderboardSegment =
  "top_this_week" | "top_this_month" | "rising_stars" | "biggest_open_pnl" | "whales" | "known_traders"

export type FeedSegment = "big_moves" | "big_closes" | "new_positions" | "following"

export type TradeEventFeedKind = "all" | "closes" | "opens"

export type SocialView =
  { kind: "leaderboard"; segment: LeaderboardSegment } | { kind: "feed"; segment: FeedSegment }

export type LeaderboardView = {
  title: string
  window: TopTradersWindow
  order: TopTradersOrder
  isKnownOnly: boolean
}

export const LEADERBOARD_VIEWS: Record<LeaderboardSegment, LeaderboardView> = {
  top_this_week: { title: "Top this week", window: "7d", order: "total_pnl", isKnownOnly: false },
  top_this_month: { title: "Top this month", window: "30d", order: "total_pnl", isKnownOnly: false },
  rising_stars: { title: "Rising stars", window: "7d", order: "rank_climb", isKnownOnly: false },
  biggest_open_pnl: { title: "Biggest open P&L", window: "30d", order: "open_pnl", isKnownOnly: false },
  whales: { title: "Whales", window: "30d", order: "volume", isKnownOnly: false },
  known_traders: { title: "Known traders", window: "30d", order: "total_pnl", isKnownOnly: true },
}

export const FEED_VIEWS: Record<FeedSegment, { title: string; feed: TradeEventFeedKind }> = {
  big_moves: { title: "Big moves", feed: "all" },
  big_closes: { title: "Big closes", feed: "closes" },
  new_positions: { title: "New positions", feed: "opens" },
  following: { title: "Following", feed: "all" },
}

export const LEADERBOARD_SEGMENTS = Object.keys(LEADERBOARD_VIEWS) as LeaderboardSegment[]

export const FEED_SEGMENTS = Object.keys(FEED_VIEWS) as FeedSegment[]

export const DEFAULT_SOCIAL_VIEW: SocialView = { kind: "feed", segment: "big_moves" }
