import "server-only"
import Big from "big.js"
import { db } from "@/backend/db/client"
import type {
  DecimalString,
  EarningsSeriesBucket,
  EarningsSeriesPoint,
  EarningsSeriesRange,
  EarningsSeriesResponse,
} from "@/lib/referral-site/types"
import { SiteError } from "./errors"
import { getMe } from "./me"

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

const BUCKET_MS: Record<EarningsSeriesBucket, number> = { hour: HOUR_MS, day: DAY_MS }

const RANGES: Record<EarningsSeriesRange, { bucket: EarningsSeriesBucket; lookbackMs: number | null }> = {
  "1W": { bucket: "hour", lookbackMs: 7 * DAY_MS },
  "1M": { bucket: "day", lookbackMs: 30 * DAY_MS },
  ALL: { bucket: "day", lookbackMs: null },
}

export const DEFAULT_EARNINGS_RANGE: EarningsSeriesRange = "1M"

export type BucketTotal = { start: number; earned: DecimalString }

export function parseEarningsRange(value: string | null): EarningsSeriesRange {
  if (value === null) return DEFAULT_EARNINGS_RANGE
  if (value === "1W" || value === "1M" || value === "ALL") return value
  throw new SiteError(400, "invalid_range", "Range must be 1W, 1M or ALL.")
}

export function bucketSizeMs(range: EarningsSeriesRange): number {
  return BUCKET_MS[RANGES[range].bucket]
}

function seriesStart(buckets: BucketTotal[], range: EarningsSeriesRange, now: number): number {
  const step = bucketSizeMs(range)
  const lookbackMs = RANGES[range].lookbackMs
  if (lookbackMs !== null) return Math.floor((now - lookbackMs) / step) * step
  return buckets.reduce((earliest, bucket) => Math.min(earliest, bucket.start), Math.floor(now / step) * step)
}

export function buildEarningsSeries(
  buckets: BucketTotal[],
  range: EarningsSeriesRange,
  now: number,
): EarningsSeriesResponse {
  const step = bucketSizeMs(range)
  const since = seriesStart(buckets, range, now)
  const inRange = new Map<number, Big>()
  let baseline = new Big(0)
  let total = new Big(0)
  for (const bucket of buckets) {
    total = total.plus(bucket.earned)
    if (bucket.start < since) baseline = baseline.plus(bucket.earned)
    else inRange.set(bucket.start, (inRange.get(bucket.start) ?? new Big(0)).plus(bucket.earned))
  }
  const points: EarningsSeriesPoint[] = [
    { time: new Date(since).toISOString(), earnedUsd: baseline.toFixed() },
  ]
  let running = baseline
  for (let start = since; start < now; start += step) {
    running = running.plus(inRange.get(start) ?? 0)
    points.push({ time: new Date(Math.min(start + step, now)).toISOString(), earnedUsd: running.toFixed() })
  }
  return {
    range,
    bucket: RANGES[range].bucket,
    totalEarnedUsd: total.toFixed(),
    rangeEarnedUsd: total.minus(baseline).toFixed(),
    points,
  }
}

export async function getEarningsSeries(
  privyUserId: string,
  range: EarningsSeriesRange,
): Promise<EarningsSeriesResponse> {
  const me = await getMe(privyUserId)
  const step = bucketSizeMs(range)
  const sql = db()
  const rows = await sql<{ start: number; earned: string }[]>`
      select
        (floor(extract(epoch from f.time) * 1000 / ${step}) * ${step})::bigint as start,
        sum(e.referrer_earned)::text as earned
      from earnings e
      join fills f on f.address = e.referee and f.tid = e.tid
      where e.referrer = ${me.address}
      group by 1
      order by 1`
  return buildEarningsSeries(
    rows.map((row) => ({ start: Number(row.start), earned: row.earned })),
    range,
    Date.now(),
  )
}
