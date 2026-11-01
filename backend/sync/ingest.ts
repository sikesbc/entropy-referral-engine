import "server-only"
import type postgres from "postgres"
import { db } from "@/backend/db/client"
import type { HyperliquidFill } from "@/backend/hyperliquid/info"
import { deployerShareFromScale } from "@/backend/referrals/deployer-share"
import { computeEarning } from "@/backend/referrals/earnings"
import { notifyRefereeActivity } from "@/backend/email/notify"
import type { MarketBoost } from "@/lib/referral-site/market-programs"

export type FillOrigin = "hyperliquid" | "simulated"

export type TradedFill = HyperliquidFill & { traderAddress: string }

export type IngestResult = { fillsInserted: number; earningsInserted: number }

const IO_PREFIX = "io:"
const CHUNK_SIZE = 1000

const FILL_COLUMNS = [
  "address",
  "tid",
  "trader_address",
  "coin",
  "time",
  "px",
  "sz",
  "side",
  "fee",
  "builder_fee",
  "fee_token",
  "hash",
  "source",
] as const

const EARNING_COLUMNS = [
  "referee",
  "tid",
  "referrer",
  "net_fee",
  "deployer_share",
  "referrer_rate",
  "entropy_earned",
  "referrer_earned",
] as const

function chunk<T>(items: T[]): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += CHUNK_SIZE) {
    chunks.push(items.slice(index, index + CHUNK_SIZE))
  }
  return chunks
}

function toFillRow(address: string, fill: TradedFill, origin: FillOrigin) {
  return {
    address,
    tid: fill.tid,
    trader_address: fill.traderAddress,
    coin: fill.coin,
    time: new Date(fill.time),
    px: fill.px,
    sz: fill.sz,
    side: fill.side,
    fee: fill.fee,
    builder_fee: fill.builderFee ?? "0",
    fee_token: fill.feeToken,
    hash: fill.hash,
    source: origin,
  }
}

async function insertFillRows(
  tx: postgres.TransactionSql,
  rows: ReturnType<typeof toFillRow>[],
): Promise<number> {
  let inserted = 0
  for (const rowChunk of chunk(rows)) {
    const result = await tx`
      insert into fills ${tx(rowChunk, ...FILL_COLUMNS)}
      on conflict (address, tid) do nothing
      returning tid
    `
    inserted += result.length
  }
  return inserted
}

export async function ingestOwnFills(
  address: string,
  fills: TradedFill[],
  origin: FillOrigin,
): Promise<number> {
  const rows = fills
    .filter((fill) => fill.coin.startsWith(IO_PREFIX))
    .map((fill) => toFillRow(address, fill, origin))
  if (rows.length === 0) return 0
  return db().begin((tx) => insertFillRows(tx, rows))
}

export async function ingestFills(
  referee: string,
  referrer: string,
  attributedAt: number,
  fills: TradedFill[],
  origin: FillOrigin,
): Promise<IngestResult> {
  const ioFills = fills.filter((fill) => fill.coin.startsWith(IO_PREFIX) && fill.time >= attributedAt)
  if (ioFills.length === 0) return { fillsInserted: 0, earningsInserted: 0 }

  const result = await db().begin(async (tx) => {
    const [config] = await tx<{ referrer_rate: string; deployer_fee_scale: string }[]>`
      select referrer_rate, deployer_fee_scale from program_config
    `
    const deployerShare = deployerShareFromScale(config.deployer_fee_scale)
    const referrerRate = config.referrer_rate

    const programs = await tx<{ coin: string; boost_rate: string; boost_until: Date | null }[]>`
      select coin, boost_rate::text as boost_rate, boost_until from market_programs
    `
    const unlocks = await tx<{ coin: string; unlocked_at: Date }[]>`
      select coin, unlocked_at from market_unlocks where address = ${referrer}
    `
    const boosts = new Map<string, MarketBoost>()
    for (const program of programs) {
      if (program.boost_until)
        boosts.set(program.coin, { until: program.boost_until.getTime(), rate: program.boost_rate })
    }
    const unlockedAt = new Map(unlocks.map((unlock) => [unlock.coin, unlock.unlocked_at.getTime()]))

    const fillRows = ioFills.map((fill) => toFillRow(referee, fill, origin))

    const earningRows = ioFills.flatMap((fill) => {
      const result = computeEarning(fill, {
        attributedAt,
        deployerShare,
        referrerRate,
        unlockedAt: unlockedAt.get(fill.coin) ?? null,
        boost: boosts.get(fill.coin) ?? null,
      })
      if (!result.counted) return []
      return [
        {
          referee,
          tid: fill.tid,
          referrer,
          net_fee: result.netFee,
          deployer_share: deployerShare,
          referrer_rate: result.referrerRate,
          entropy_earned: result.entropyEarned,
          referrer_earned: result.referrerEarned,
        },
      ]
    })

    const fillsInserted = await insertFillRows(tx, fillRows)

    let earningsInserted = 0
    for (const rows of chunk(earningRows)) {
      const inserted = await tx`
        insert into earnings ${tx(rows, ...EARNING_COLUMNS)}
        on conflict (referee, tid) do nothing
        returning tid
      `
      earningsInserted += inserted.length
    }

    return { fillsInserted, earningsInserted }
  })
  await notifyRefereeActivity(referee, referrer, result.fillsInserted)
  return result
}
