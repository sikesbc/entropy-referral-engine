import Big from "big.js"
import { REFERRER_SHARE } from "./config"
import type { DecimalString, ReferralMarket, ReferralMarketState } from "./types"

export const UNLOCK_VOLUME_USD = 10000
export const UNLOCKED_RATE: DecimalString = "0.6"
export const BOOST_RATE: DecimalString = "0.75"

export const IO_MARKET_COINS = [
  "io:NVDA",
  "io:ANTH",
  "io:OAI",
  "io:SNDK",
  "io:DRAM",
  "io:IONQ",
  "io:NBIS",
  "io:EWY",
  "io:GPRO",
  "io:TCNT",
  "io:XIAOMI",
  "io:PRL",
]

export type Instant = number | string

export type MarketBoost = { until: Instant; rate?: DecimalString }

export type MarketProgramInput = {
  coin: string
  unlockedAt?: Instant | null
  boost?: MarketBoost | null
  base?: DecimalString
}

function toMs(instant: Instant): number {
  return typeof instant === "number" ? instant : Date.parse(instant)
}

function isActive(until: Instant | undefined, time: Instant): boolean {
  return until !== undefined && toMs(time) < toMs(until)
}

function maxRate(rates: DecimalString[]): DecimalString {
  return rates.reduce((best, rate) => (new Big(rate).gt(best) ? rate : best))
}

export function rateForTrade(
  input: MarketProgramInput & { time: Instant; joinedAt?: Instant },
): DecimalString {
  const { time, joinedAt = time, unlockedAt, boost, base = REFERRER_SHARE } = input
  const rates = [base]
  if (unlockedAt != null && toMs(unlockedAt) <= toMs(time) && toMs(unlockedAt) <= toMs(joinedAt))
    rates.push(UNLOCKED_RATE)
  if (boost && isActive(boost.until, time)) rates.push(boost.rate ?? BOOST_RATE)
  return maxRate(rates)
}

export function marketState(input: Omit<MarketProgramInput, "coin"> & { now: Instant }): ReferralMarketState {
  const { now, unlockedAt, boost } = input
  if (boost && isActive(boost.until, now)) return "boosted"
  if (unlockedAt != null && toMs(unlockedAt) <= toMs(now)) return "unlocked"
  return "locked"
}

export function symbolForCoin(coin: string): string {
  return coin.replace(/^io:/, "")
}

export function buildMarket(
  input: MarketProgramInput & { now: Instant; ownVolumeUsd: DecimalString },
): ReferralMarket {
  const { coin, now, ownVolumeUsd, unlockedAt = null, boost = null, base } = input
  const state = marketState({ now, unlockedAt, boost })
  return {
    coin,
    symbol: symbolForCoin(coin),
    ownVolumeUsd,
    unlockVolumeUsd: String(UNLOCK_VOLUME_USD),
    state,
    rate: rateForTrade({ coin, time: now, unlockedAt, boost, base }),
    boostUntil: boost && state === "boosted" ? new Date(toMs(boost.until)).toISOString() : null,
    unlockedAt: unlockedAt != null ? new Date(toMs(unlockedAt)).toISOString() : null,
  }
}
