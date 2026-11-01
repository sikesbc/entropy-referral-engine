import "server-only"
import { db } from "@/backend/db/client"
import { marketState, rateForTrade } from "@/lib/referral-site/market-programs"
import type { DecimalString, ReferralMarketState } from "@/lib/referral-site/types"

export type ReferrerMarketRate = { state: ReferralMarketState; rate: DecimalString }

export async function referrerMarketRate(address: string, id: string): Promise<ReferrerMarketRate> {
  const coin = `io:${id}`
  const sql = db()
  const programs = await sql<{ boost_rate: string; boost_until: Date | null }[]>`
      select boost_rate::text as boost_rate, boost_until from market_programs where coin = ${coin}`
  const unlocks = await sql<{ unlocked_at: Date }[]>`
      select unlocked_at from market_unlocks where address = ${address} and coin = ${coin}`
  const program = programs[0]
  const now = Date.now()
  const unlockedAt = unlocks[0] ? unlocks[0].unlocked_at.getTime() : null
  const boost = program?.boost_until
    ? { until: program.boost_until.getTime(), rate: program.boost_rate }
    : null
  return {
    state: marketState({ now, unlockedAt, boost }),
    rate: rateForTrade({ coin, time: now, unlockedAt, boost }),
  }
}
