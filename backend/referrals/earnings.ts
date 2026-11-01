import "server-only"
import Big from "big.js"
import { rateForTrade, type MarketBoost } from "@/lib/referral-site/market-programs"

export type Fill = {
  coin: string
  fee: string
  builderFee?: string
  feeToken: string
  time: number
  tid: number
}

export type EarningContext = {
  attributedAt: number
  deployerShare: string
  referrerRate: string
  unlockedAt?: number | null
  boost?: MarketBoost | null
}

export type EarningResult =
  | { counted: false; reason: "not_io" | "before_attribution" | "unsupported_fee_token" }
  | { counted: true; netFee: string; entropyEarned: string; referrerEarned: string; referrerRate: string }

const IO_PREFIX = "io:"
const SUPPORTED_FEE_TOKEN = "USDC"

export function computeEarning(fill: Fill, ctx: EarningContext): EarningResult {
  if (!fill.coin.startsWith(IO_PREFIX)) return { counted: false, reason: "not_io" }
  if (fill.time < ctx.attributedAt) return { counted: false, reason: "before_attribution" }
  if (fill.feeToken !== SUPPORTED_FEE_TOKEN) {
    return { counted: false, reason: "unsupported_fee_token" }
  }

  const referrerRate = rateForTrade({
    coin: fill.coin,
    time: fill.time,
    joinedAt: ctx.attributedAt,
    unlockedAt: ctx.unlockedAt,
    boost: ctx.boost,
    base: ctx.referrerRate,
  })
  const netFee = new Big(fill.fee).minus(fill.builderFee ?? "0")
  if (netFee.lte(0)) {
    return { counted: true, netFee: netFee.toFixed(), entropyEarned: "0", referrerEarned: "0", referrerRate }
  }

  const entropyEarned = netFee.times(ctx.deployerShare)
  const referrerEarned = entropyEarned.times(referrerRate)
  return {
    counted: true,
    netFee: netFee.toFixed(),
    entropyEarned: entropyEarned.toFixed(),
    referrerEarned: referrerEarned.toFixed(),
    referrerRate,
  }
}

export function fillKey(address: string, tid: number): string {
  return `${address}:${tid}`
}

export function sumEarnings(values: string[]): string {
  return values.reduce((total, value) => total.plus(value), new Big(0)).toFixed()
}
