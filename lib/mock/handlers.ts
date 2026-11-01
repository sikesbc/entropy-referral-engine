import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { sessionSideFrom } from "@/lib/auth/server"
import type { SessionSide } from "@/lib/auth/types"
import { isDeterministic } from "@/lib/runtime/env"
import {
  captureTime,
  findHttpFixture,
  findHyperliquidFixture,
  findLiveTicksFixture,
  findMarkPrice,
  type FixtureRecord,
  type HyperliquidRequestBody,
} from "./fixtures"

const PRIVATE_PREFIXES = ["/api/account/", "/api/me/", "/api/trading/", "/api/compliance/", "/api/referrals/"]
const PUBLIC_EXCEPTIONS = new Set(["/api/referrals/program"])

function otherSide(side: SessionSide): SessionSide {
  return side === "loggedin" ? "loggedout" : "loggedin"
}

function requiresSession(pathname: string): boolean {
  if (PUBLIC_EXCEPTIONS.has(pathname)) return false
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function respond(record: FixtureRecord) {
  return NextResponse.json(record.response, { status: record.status })
}

export async function serveFixture(request: NextRequest) {
  const side = sessionSideFrom(request.cookies)
  const { pathname, searchParams } = request.nextUrl
  if (side === "loggedout" && requiresSession(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const record =
    (await findHttpFixture(side, request.method, pathname, searchParams)) ??
    (await findHttpFixture(otherSide(side), request.method, pathname, searchParams))
  if (!record) return NextResponse.json({ error: "No fixture recorded" }, { status: 404 })
  return respond(record)
}

const SYNTHETIC_TICK_COUNT = 180
const SYNTHETIC_TICK_SPACING_SECONDS = 5
const ALLOWED_GEO_STATUS = { restricted: false, country: "US", mode: "trading", reason: null }

export async function serveLiveTicks(request: NextRequest) {
  const side = sessionSideFrom(request.cookies)
  const coin = request.nextUrl.searchParams.get("coin")
  if (!coin) return NextResponse.json({ error: "coin is required" }, { status: 400 })
  const record =
    (await findLiveTicksFixture(side, coin)) ?? (await findLiveTicksFixture(otherSide(side), coin))
  if (record) return respond(record)
  const price = await findMarkPrice(side, coin)
  if (price === null) return NextResponse.json([])
  const end = Math.floor((await captureTime(side)) / 1000)
  const ticks = Array.from({ length: SYNTHETIC_TICK_COUNT }, (_, index) => [
    end - (SYNTHETIC_TICK_COUNT - 1 - index) * SYNTHETIC_TICK_SPACING_SECONDS,
    price,
  ])
  return NextResponse.json(ticks)
}

export async function serveGeoStatus(request: NextRequest) {
  const override = process.env.MOCK_GEO
  const blocked = override === "blocked" || (override !== "allowed" && isDeterministic())
  if (blocked) return serveFixture(request)
  return NextResponse.json(ALLOWED_GEO_STATUS)
}

export async function serveTopTrades(request: NextRequest) {
  const response = await serveFixture(request)
  if (!response.ok) return response
  const page: { events: unknown[]; nextOffset: number | null } = await response.json()
  const { searchParams } = request.nextUrl
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0)
  const limit = Math.max(1, Number(searchParams.get("limit")) || page.events.length)
  const events = page.events.slice(offset, offset + limit)
  const nextOffset = events.length === 0 ? null : offset + events.length
  return NextResponse.json({ ...page, events, nextOffset })
}

function isInfoBody(value: unknown): value is HyperliquidRequestBody {
  return typeof value === "object" && value !== null && typeof (value as { type?: unknown }).type === "string"
}

export async function serveHyperliquidInfo(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null)
  if (!isInfoBody(body)) return NextResponse.json({ error: "Invalid info request" }, { status: 400 })
  const side = sessionSideFrom(request.cookies)
  const record =
    (await findHyperliquidFixture(side, body)) ?? (await findHyperliquidFixture(otherSide(side), body))
  if (record) return respond(record)
  if (body.type === "candleSnapshot") return NextResponse.json([])
  return NextResponse.json({ error: `No fixture recorded for ${body.type}` }, { status: 404 })
}
