import "server-only"
import { timingSafeEqual } from "node:crypto"
import { db } from "@/backend/db/client"
import { IO_MARKET_COINS } from "@/lib/referral-site/market-programs"

export const dynamic = "force-dynamic"

type Gate = "ok" | "disabled" | "unauthorized"

type BoostInput = { coin: string; rate: string; until: Date }

const KNOWN_COINS = new Set<string>(IO_MARKET_COINS)

function gate(request: Request): Gate {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return "disabled"
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(request.headers.get("authorization") ?? "")
  return expected.length === received.length && timingSafeEqual(expected, received) ? "ok" : "unauthorized"
}

function denied(state: Gate) {
  return state === "disabled"
    ? Response.json({ error: "not_found" }, { status: 404 })
    : Response.json({ error: "unauthorized" }, { status: 401 })
}

function knownCoin(value: unknown): string | null {
  return typeof value === "string" && KNOWN_COINS.has(value) ? value : null
}

function parseRate(value: unknown): string | null {
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : ""
  if (!/^\d+(\.\d+)?$/.test(text)) return null
  const rate = Number(text)
  return rate >= 0 && rate <= 1 ? text : null
}

function parseUntil(value: unknown, now: number): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null
  const until = new Date(value)
  return Number.isFinite(until.getTime()) && until.getTime() > now ? until : null
}

function parseBoost(body: unknown, now: number): BoostInput | string {
  if (typeof body !== "object" || body === null) return "invalid_body"
  const input = body as Record<string, unknown>
  const coin = knownCoin(input.coin)
  if (!coin) return "unknown_coin"
  const rate = parseRate(input.boost_rate)
  if (rate === null) return "invalid_boost_rate"
  const until = parseUntil(input.boost_until, now)
  if (!until) return "invalid_boost_until"
  return { coin, rate, until }
}

export async function POST(request: Request) {
  const state = gate(request)
  if (state !== "ok") return denied(state)
  const parsed = parseBoost(await request.json().catch(() => null), Date.now())
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 })
  const [row] = await db()<{ coin: string; boost_rate: string; boost_until: Date }[]>`
    insert into market_programs (coin, boost_rate, boost_until, updated_at)
    values (${parsed.coin}, ${parsed.rate}, ${parsed.until}, now())
    on conflict (coin) do update set
      boost_rate = excluded.boost_rate,
      boost_until = excluded.boost_until,
      updated_at = excluded.updated_at
    returning coin, boost_rate::text as boost_rate, boost_until
  `
  return Response.json({ ok: true, program: row })
}

export async function DELETE(request: Request) {
  const state = gate(request)
  if (state !== "ok") return denied(state)
  const fromQuery = new URL(request.url).searchParams.get("coin")
  const body = fromQuery ? null : ((await request.json().catch(() => null)) as { coin?: unknown } | null)
  const coin = knownCoin(fromQuery ?? body?.coin)
  if (!coin) return Response.json({ error: "unknown_coin" }, { status: 400 })
  const removed = await db()`delete from market_programs where coin = ${coin} returning coin`
  return Response.json({ ok: true, cleared: removed.length > 0 })
}
