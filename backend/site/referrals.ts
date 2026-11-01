import "server-only"
import Big from "big.js"
import { db } from "@/backend/db/client"
import { ENTROPY_SHARE } from "@/lib/referral-site/config"
import { IO_MARKET_COINS, buildMarket } from "@/lib/referral-site/market-programs"
import type {
  RecentTrade,
  ReferralMarket,
  ReferralsResponse,
  ReferredTrader,
  SiteMe,
} from "@/lib/referral-site/types"
import { getMe } from "./me"

type ReferralRow = {
  address: string
  username: string
  joined_at: Date
  first_trade_at: Date | null
  last_trade_at: Date | null
  volume: string
  fees: string
  earned: string
}

type RecentTradeRow = {
  address: string
  tid: string
  username: string
  coin: string
  time: Date
  side: "buy" | "sell"
  size: string
  fee: string
  earned: string
}

const RECENT_TRADES_LIMIT = 50

type ContextRow = {
  updated_at: Date | null
  referrer_rate: string | null
  programs: { coin: string; boost_rate: string; boost_until_ms: number | null }[]
  unlocks: { coin: string; unlocked_at_ms: number }[]
  volumes: { coin: string; volume: string }[]
}

async function loadContext(referrer: string): Promise<ContextRow> {
  const [row] = await db()<ContextRow[]>`
      select
        (select max(s.last_synced_at)
          from sync_state s
          join attributions a on a.referee = s.address
          where a.referrer = ${referrer}) as updated_at,
        (select referrer_rate::text from program_config limit 1) as referrer_rate,
        coalesce((select json_agg(json_build_object(
            'coin', coin,
            'boost_rate', boost_rate::text,
            'boost_until_ms', floor(extract(epoch from boost_until) * 1000)::bigint))
          from market_programs), '[]'::json) as programs,
        coalesce((select json_agg(json_build_object(
            'coin', coin,
            'unlocked_at_ms', floor(extract(epoch from unlocked_at) * 1000)::bigint))
          from market_unlocks where address = ${referrer}), '[]'::json) as unlocks,
        coalesce((select json_agg(json_build_object('coin', coin, 'volume', volume))
          from (select coin, sum(px * sz)::text as volume from fills
            where address = ${referrer} and coin like 'io:%' group by coin) v), '[]'::json) as volumes`
  return row
}

function buildMarkets(context: ContextRow, base: string): ReferralMarket[] {
  const now = Date.now()
  return IO_MARKET_COINS.map((coin) => {
    const program = context.programs.find((row) => row.coin === coin)
    const unlock = context.unlocks.find((row) => row.coin === coin)
    return buildMarket({
      coin,
      now,
      base,
      ownVolumeUsd: context.volumes.find((row) => row.coin === coin)?.volume ?? "0",
      unlockedAt: unlock ? Number(unlock.unlocked_at_ms) : null,
      boost:
        program?.boost_until_ms != null
          ? { until: Number(program.boost_until_ms), rate: program.boost_rate }
          : null,
    })
  })
}

function sum(values: string[]): string {
  return values.reduce((total, value) => total.plus(value), new Big(0)).toFixed()
}

function toTrader(row: ReferralRow): ReferredTrader {
  return {
    address: row.address,
    username: row.username,
    joinedAt: row.joined_at.toISOString(),
    firstTradeAt: row.first_trade_at ? row.first_trade_at.toISOString() : null,
    lastTradeAt: row.last_trade_at ? row.last_trade_at.toISOString() : null,
    volumeUsd: row.volume,
    feesPaidUsd: row.fees,
    earnedUsd: row.earned,
  }
}

function toRecentTrade(row: RecentTradeRow): RecentTrade {
  return {
    tid: row.tid,
    time: row.time.toISOString(),
    address: row.address,
    username: row.username,
    coin: row.coin,
    side: row.side,
    sizeUsd: row.size,
    feeUsd: row.fee,
    earnedUsd: row.earned,
  }
}

async function loadReferralRows(referrer: string): Promise<ReferralRow[]> {
  return db()<ReferralRow[]>`
      select
        a.referee as address,
        ru.username,
        a.attributed_at as joined_at,
        f.first_trade_at,
        f.last_trade_at,
        coalesce(f.volume, 0)::text as volume,
        coalesce(f.fees, 0)::text as fees,
        coalesce(e.earned, 0)::text as earned
      from attributions a
      join users ru on ru.address = a.referee
      left join lateral (
        select min(time) as first_trade_at, max(time) as last_trade_at, sum(px * sz) as volume, sum(greatest(fee - builder_fee, 0)) as fees
        from fills
        where address = a.referee and coin like 'io:%'
      ) f on true
      left join lateral (
        select sum(referrer_earned) as earned
        from earnings
        where referee = a.referee and referrer = a.referrer
      ) e on true
      where a.referrer = ${referrer}
      order by a.attributed_at desc`
}

async function loadRecentTrades(referrer: string): Promise<RecentTradeRow[]> {
  return db()<RecentTradeRow[]>`
      select
        f.address,
        f.tid::text as tid,
        u.username,
        f.coin,
        f.time,
        case when f.side = 'B' then 'buy' else 'sell' end as side,
        (f.px * f.sz)::text as size,
        e.net_fee::text as fee,
        e.referrer_earned::text as earned
      from earnings e
      join fills f on f.address = e.referee and f.tid = e.tid
      join users u on u.address = e.referee
      where e.referrer = ${referrer} and f.coin like 'io:%'
      order by f.time desc, f.tid desc
      limit ${RECENT_TRADES_LIMIT}
    `
}

export async function getReferralsFor(referrer: string): Promise<ReferralsResponse> {
  const [rows, trades, context] = await Promise.all([
    loadReferralRows(referrer),
    loadRecentTrades(referrer),
    loadContext(referrer),
  ])
  const referrals = rows.map(toTrader)
  const referrerShare = new Big(context.referrer_rate ?? "0.5").toFixed()
  return {
    updatedAt: (context.updated_at ?? new Date()).toISOString(),
    rates: {
      entropyShare: ENTROPY_SHARE,
      referrerShare,
    },
    totals: {
      earnedUsd: sum(rows.map((row) => row.earned)),
      volumeUsd: sum(rows.map((row) => row.volume)),
      referredCount: referrals.length,
      tradingCount: referrals.filter((trader) => trader.firstTradeAt !== null).length,
    },
    referrals,
    recentTrades: trades.map(toRecentTrade),
    markets: buildMarkets(context, referrerShare),
  }
}

export async function getReferrals(
  privyUserId: string,
  me?: Pick<SiteMe, "address">,
): Promise<ReferralsResponse> {
  return getReferralsFor((me ?? (await getMe(privyUserId))).address)
}
