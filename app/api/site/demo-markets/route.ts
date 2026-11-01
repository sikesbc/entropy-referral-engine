import "server-only"
import { getSessionUserId } from "@/backend/auth/session"
import { db } from "@/backend/db/client"
import { getReferralsFor } from "@/backend/site/referrals"
import { BOOST_RATE, buildMarket } from "@/lib/referral-site/market-programs"
import {
  applyMarketDemo,
  demoBoostUntil,
  KEPT_BOOST_COIN,
  type MarketDemoAction,
} from "@/lib/referral-site/mock-api"
import type { ReferralMarket } from "@/lib/referral-site/types"

export const dynamic = "force-dynamic"

const ACTIONS: MarketDemoAction[] = ["unlock", "boost", "end_boosts"]

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status })
}

function parseAction(value: unknown): MarketDemoAction | null {
  if (typeof value !== "object" || value === null) return null
  const action = (value as { action?: unknown }).action
  return ACTIONS.find((candidate) => candidate === action) ?? null
}

async function unlock(address: string, markets: ReferralMarket[], now: number) {
  const { market } = applyMarketDemo(markets, "unlock", now)
  if (!market) return json({ error: "no_locked_market" }, 409)

  const inserted = await db()`
    insert into market_unlocks (address, coin, unlocked_at)
    values (${address}, ${market.coin}, ${new Date(now)})
    on conflict (address, coin) do nothing
    returning coin
  `
  if (inserted.length === 0) return json({ error: "no_locked_market" }, 409)

  return json({ ok: true, market })
}

async function startBoost(markets: ReferralMarket[], now: number) {
  const candidates = markets.filter((market) => market.state !== "boosted")
  const target = candidates[Math.floor(Math.random() * candidates.length)]
  if (!target) return json({ error: "no_unboosted_market" }, 409)

  const until = demoBoostUntil(now)
  await db()`
    insert into market_programs (coin, boost_rate, boost_until, updated_at)
    values (${target.coin}, ${BOOST_RATE}, ${new Date(until)}, now())
    on conflict (coin) do update
      set boost_rate = excluded.boost_rate,
          boost_until = excluded.boost_until,
          updated_at = excluded.updated_at
  `

  const market = buildMarket({
    coin: target.coin,
    now,
    ownVolumeUsd: target.ownVolumeUsd,
    unlockedAt: target.unlockedAt,
    boost: { until, rate: BOOST_RATE },
  })
  return json({ ok: true, market })
}

async function endBoosts() {
  await db()`delete from market_programs where coin <> ${KEPT_BOOST_COIN}`
  return json({ ok: true })
}

export async function POST(request: Request) {
  if (process.env.DEMO_TOOLS !== "1") return json({ error: "not_found" }, 404)

  const privyUserId = await getSessionUserId(request)
  if (!privyUserId) return json({ error: "unauthorized" }, 401)

  const action = parseAction(await request.json().catch(() => null))
  if (!action) return json({ error: "invalid_action" }, 400)

  const [user] = await db()<{ address: string }[]>`
    select address from users where privy_user_id = ${privyUserId}
  `
  if (!user) return json({ error: "not_registered" }, 403)

  if (action === "end_boosts") return endBoosts()

  const now = Date.now()
  const { markets } = await getReferralsFor(user.address)
  return action === "boost" ? startBoost(markets, now) : unlock(user.address, markets, now)
}
