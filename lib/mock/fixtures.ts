import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"
import type { SessionSide } from "@/lib/auth/types"

export type FixtureIndexEntry = {
  id: string
  method: string
  url: string
  path: string
  query: Record<string, string>
  request: unknown
  status: number
  contentType: string
  route: string
  capturedAt: string
  requestType: string | null
}

export type FixtureRecord = FixtureIndexEntry & { response: unknown }

const FIXTURE_ROOT = path.join(process.cwd(), "fixtures")
const ENTROPY_ORIGIN = "https://entropy.io"
const HYPERLIQUID_URLS = new Set([
  "https://entropy.io/api/hyperliquid/info",
  "https://api.hyperliquid.xyz/info",
])
const VOLATILE_KEYS = new Set(["startTime", "endTime", "_"])

const indexCache = new Map<SessionSide, Promise<FixtureIndexEntry[]>>()
const recordCache = new Map<string, Promise<FixtureRecord>>()

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T
}

export function loadFixtureIndex(side: SessionSide): Promise<FixtureIndexEntry[]> {
  let cached = indexCache.get(side)
  if (!cached) {
    cached = readJson<FixtureIndexEntry[]>(path.join(FIXTURE_ROOT, side, "http-index.json"))
    indexCache.set(side, cached)
  }
  return cached
}

export function loadFixture(side: SessionSide, id: string): Promise<FixtureRecord> {
  const key = `${side}/${id}`
  let cached = recordCache.get(key)
  if (!cached) {
    cached = readJson<FixtureRecord>(path.join(FIXTURE_ROOT, side, "http", `${id}.json`))
    recordCache.set(key, cached)
  }
  return cached
}

export async function captureTime(side: SessionSide): Promise<number> {
  const index = await loadFixtureIndex(side)
  return Math.min(...index.map((entry) => Date.parse(entry.capturedAt)))
}

function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === "string" && typeof b === "string") return a.toLowerCase() === b.toLowerCase()
  return JSON.stringify(a) === JSON.stringify(b)
}

function pickBest(
  entries: FixtureIndexEntry[],
  score: (entry: FixtureIndexEntry) => number,
): FixtureIndexEntry | null {
  let best: FixtureIndexEntry | null = null
  let bestScore = Number.NEGATIVE_INFINITY
  for (const entry of entries) {
    const value = score(entry)
    if (value > bestScore || (value === bestScore && best !== null && entry.capturedAt > best.capturedAt)) {
      best = entry
      bestScore = value
    }
  }
  return best
}

function scoreQuery(entry: FixtureIndexEntry, query: URLSearchParams): number {
  let score = 0
  const keys = new Set([...Object.keys(entry.query), ...query.keys()])
  for (const key of keys) {
    if (VOLATILE_KEYS.has(key)) continue
    const recorded = entry.query[key]
    const requested = query.get(key)
    if (recorded === undefined || requested === null) score -= 1
    else if (sameValue(recorded, requested)) score += 2
    else score -= 2
  }
  return score
}

export async function findHttpFixture(
  side: SessionSide,
  method: string,
  pathname: string,
  query: URLSearchParams,
): Promise<FixtureRecord | null> {
  const index = await loadFixtureIndex(side)
  const candidates = index.filter(
    (entry) => entry.method === method && entry.path === pathname && entry.url.startsWith(ENTROPY_ORIGIN),
  )
  const best = pickBest(candidates, (entry) => scoreQuery(entry, query))
  return best ? loadFixture(side, best.id) : null
}

export type HyperliquidRequestBody = { type: string } & Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function scoreFields(recorded: Record<string, unknown>, requested: Record<string, unknown>): number {
  let score = 0
  const keys = new Set([...Object.keys(recorded), ...Object.keys(requested)])
  for (const key of keys) {
    if (key === "type" || VOLATILE_KEYS.has(key)) continue
    const a = recorded[key]
    const b = requested[key]
    if (isRecord(a) && isRecord(b)) score += scoreFields(a, b)
    else if (a === undefined || b === undefined) score -= 1
    else if (sameValue(a, b)) score += 2
    else score -= 2
  }
  return score
}

function candleKey(body: Record<string, unknown>): { coin: unknown; interval: unknown } {
  const req = isRecord(body.req) ? body.req : {}
  return { coin: req.coin, interval: req.interval }
}

export async function findHyperliquidFixture(
  side: SessionSide,
  body: HyperliquidRequestBody,
): Promise<FixtureRecord | null> {
  const index = await loadFixtureIndex(side)
  let candidates = index.filter(
    (entry) =>
      entry.method === "POST" &&
      entry.requestType === body.type &&
      HYPERLIQUID_URLS.has(entry.url) &&
      isRecord(entry.request),
  )
  if (body.type === "candleSnapshot") {
    const wanted = candleKey(body)
    candidates = candidates.filter((entry) =>
      sameValue(candleKey(entry.request as Record<string, unknown>).coin, wanted.coin),
    )
  }
  const best = pickBest(candidates, (entry) => {
    const fieldScore = scoreFields(entry.request as Record<string, unknown>, body)
    return fieldScore + (entry.url.startsWith(ENTROPY_ORIGIN) ? 0.5 : 0)
  })
  return best ? loadFixture(side, best.id) : null
}

export async function findLiveTicksFixture(side: SessionSide, coin: string): Promise<FixtureRecord | null> {
  const index = await loadFixtureIndex(side)
  const entry = index.find(
    (candidate) =>
      candidate.method === "GET" &&
      candidate.path === "/api/markets/live-ticks" &&
      sameValue(candidate.query.coin, coin),
  )
  return entry ? loadFixture(side, entry.id) : null
}

type AssetContexts = [{ universe: { name: string }[] }, { markPx?: string }[]]

function isAssetContexts(value: unknown): value is AssetContexts {
  return Array.isArray(value) && value.length === 2 && Array.isArray(value[1])
}

export async function findMarkPrice(side: SessionSide, coin: string): Promise<number | null> {
  const dex = coin.includes(":") ? coin.slice(0, coin.indexOf(":")) : ""
  const record =
    (await findHyperliquidFixture(side, { type: "metaAndAssetCtxs", dex })) ??
    (await findHyperliquidFixture(side === "loggedin" ? "loggedout" : "loggedin", {
      type: "metaAndAssetCtxs",
      dex,
    }))
  if (!record || !isAssetContexts(record.response)) return null
  const [meta, contexts] = record.response
  const position = meta.universe.findIndex((asset) => sameValue(asset.name, coin))
  const price = Number(contexts[position]?.markPx)
  return position >= 0 && Number.isFinite(price) ? price : null
}
