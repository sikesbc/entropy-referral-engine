import { normalizeCode } from "./code"
import { ENTROPY_SHARE, REFERRER_SHARE } from "./config"
import type { ReferralsDemo, SignupDemo } from "./demo"
import Big from "big.js"
import { BOOST_RATE, buildMarket } from "./market-programs"
import {
  DEMO_EMPTY_MARKET_BOOSTS,
  DEMO_MARKET_SEEDS,
  DEMO_ME,
  DEMO_RECENT_TRADES,
  DEMO_REFERRALS,
  DEMO_TAKEN_USERNAMES,
  DEMO_TOTALS,
  KNOWN_CODES,
  type DemoReferral,
} from "./mock-data"
import type {
  Attribution,
  CodeLookup,
  ReferralMarket,
  ReferralsResponse,
  ReferredTrader,
  SignupRequest,
  SignupResponse,
  UsernameAvailability,
} from "./types"

const UPDATE_INTERVAL_MS = 60_000

export function lookupCode(code: string): CodeLookup {
  const normalized = normalizeCode(code)
  const referrer =
    KNOWN_CODES[normalized] ??
    (normalized === DEMO_ME.code
      ? { address: DEMO_ME.address, username: DEMO_ME.username, displayName: DEMO_ME.username }
      : undefined)
  return referrer ? { code: normalized, status: "valid", referrer } : { code: normalized, status: "unknown" }
}

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/
const RESERVED_USERNAMES = [
  "entropy",
  "admin",
  "support",
  "hyperliquid",
  "io",
  "api",
  "r",
  "referrals",
  "official",
  "team",
  "help",
  "mod",
  "moderator",
]

export function checkUsername(username: string): UsernameAvailability {
  const code = normalizeCode(username)
  if (!USERNAME_PATTERN.test(username.trim())) return { available: false, reason: "invalid" }
  if (RESERVED_USERNAMES.includes(code) || code.startsWith("entropy"))
    return { available: false, reason: "reserved" }
  if (DEMO_TAKEN_USERNAMES.includes(code)) return { available: false, reason: "taken" }
  return { available: true }
}

export function getReferrals(
  demo: ReferralsDemo,
  now = Math.floor(Date.now() / UPDATE_INTERVAL_MS) * UPDATE_INTERVAL_MS,
): ReferralsResponse {
  const updatedAt = new Date(
    Math.floor(now / UPDATE_INTERVAL_MS) * UPDATE_INTERVAL_MS - 2 * UPDATE_INTERVAL_MS,
  )
  const referrals = demo === "empty" ? [] : DEMO_REFERRALS.map((referral) => demoTrader(referral, now))
  return {
    updatedAt: updatedAt.toISOString(),
    rates: { entropyShare: ENTROPY_SHARE, referrerShare: REFERRER_SHARE },
    totals: {
      earnedUsd: demo === "empty" ? "0" : DEMO_TOTALS.earnedUsd,
      volumeUsd: demo === "empty" ? "0" : DEMO_TOTALS.volumeUsd,
      referredCount: referrals.length,
      tradingCount: referrals.filter((trader) => trader.firstTradeAt !== null).length,
    },
    referrals,
    recentTrades:
      demo === "empty"
        ? []
        : DEMO_RECENT_TRADES.map(({ ageMs, ...trade }) => ({
            ...trade,
            time: new Date(now - ageMs).toISOString(),
          })),
    markets: demoMarkets(demo, now),
  }
}

function demoTrader({ lastTradeAgeMs, ...referral }: DemoReferral, now: number): ReferredTrader {
  if (lastTradeAgeMs === null || referral.firstTradeAt === null) return { ...referral, lastTradeAt: null }
  const lastTradeAt = Math.max(Date.parse(referral.firstTradeAt), now - lastTradeAgeMs)
  return { ...referral, lastTradeAt: new Date(lastTradeAt).toISOString() }
}

function demoMarkets(demo: ReferralsDemo, now: number): ReferralMarket[] {
  return DEMO_MARKET_SEEDS.map(({ coin, ownVolumeUsd, unlockedAt, boost }) =>
    demo === "empty"
      ? buildMarket({ coin, now, ownVolumeUsd: "0", boost: DEMO_EMPTY_MARKET_BOOSTS[coin] })
      : buildMarket({ coin, now, ownVolumeUsd, unlockedAt, boost }),
  )
}

const DAY_MS = 86_400_000
export const DEMO_BOOST_DAYS = 14
export const KEPT_BOOST_COIN = "io:ANTH"

export type MarketDemoAction = "unlock" | "boost" | "end_boosts"

export function demoBoostUntil(now: number): number {
  return now + DEMO_BOOST_DAYS * DAY_MS
}

export function closestLockedMarket(markets: ReferralMarket[]): ReferralMarket | null {
  const progress = (market: ReferralMarket) => new Big(market.ownVolumeUsd).div(market.unlockVolumeUsd)
  return markets
    .filter((market) => market.state === "locked")
    .reduce<ReferralMarket | null>(
      (best, market) => (best && progress(best).gte(progress(market)) ? best : market),
      null,
    )
}

function endBoosts(markets: ReferralMarket[], now: number): ReferralMarket[] {
  return markets.map((market) =>
    market.state === "boosted" && market.coin !== KEPT_BOOST_COIN
      ? buildMarket({
          coin: market.coin,
          now,
          ownVolumeUsd: market.ownVolumeUsd,
          unlockedAt: market.unlockedAt,
        })
      : market,
  )
}

export function applyMarketDemo(
  markets: ReferralMarket[],
  action: MarketDemoAction,
  now = Date.now(),
): { markets: ReferralMarket[]; market: ReferralMarket | null } {
  if (action === "end_boosts") return { markets: endBoosts(markets, now), market: null }
  const target = closestLockedMarket(markets)
  if (!target) return { markets, market: null }
  const market =
    action === "unlock"
      ? buildMarket({ coin: target.coin, now, ownVolumeUsd: target.ownVolumeUsd, unlockedAt: now })
      : buildMarket({
          coin: target.coin,
          now,
          ownVolumeUsd: target.ownVolumeUsd,
          unlockedAt: target.unlockedAt,
          boost: { until: demoBoostUntil(now), rate: BOOST_RATE },
        })
  return {
    markets: markets.map((candidate) => (candidate.coin === target.coin ? market : candidate)),
    market,
  }
}

function attributionFor(code: string | null, demo: SignupDemo): Attribution {
  if (!code) return { status: "no_code" }
  const lookup = lookupCode(code)
  const referrer = lookup.status === "valid" ? lookup.referrer : null
  if (demo === "invalid" || !referrer) {
    return { status: "not_attributed", code: lookup.code, reason: "unknown_code", referrer: null }
  }
  if (demo === "existing")
    return { status: "not_attributed", code: lookup.code, reason: "existing_trader", referrer }
  return { status: "attributed", code: lookup.code, referrer }
}

export function mockSignup(address: string, request: SignupRequest, demo: SignupDemo): SignupResponse {
  const { code } = request
  const username = request.username.trim()
  const me = { ...DEMO_ME, address, username, code: normalizeCode(username) }
  if (demo === "registered") {
    return { status: "already_registered", me, ignoredCode: code ? normalizeCode(code) : null }
  }
  const attribution = attributionFor(code, demo)
  return {
    status: "registered",
    me: {
      ...me,
      registeredAt: new Date().toISOString(),
      referredBy: attribution.status === "attributed" ? attribution.referrer : null,
    },
    attribution,
  }
}
