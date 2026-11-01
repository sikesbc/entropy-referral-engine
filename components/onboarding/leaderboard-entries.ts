import type { TopTrader } from "@/lib/api/types/discovery"

export type LeaderboardEntry = {
  rank: number
  handle: string
  avatarUrl: string | null
  xUsername: string | null
}

export function leaderboardEntries(traders: TopTrader[], size: number): LeaderboardEntry[] {
  return traders.slice(0, size).map((trader) => ({
    rank: trader.rank,
    handle: trader.wallet.xUsername ?? trader.wallet.entropyUsername ?? trader.wallet.name,
    avatarUrl: trader.wallet.avatarUrl,
    xUsername: trader.wallet.xUsername,
  }))
}
