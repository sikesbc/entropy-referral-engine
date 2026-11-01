import "server-only"
import Big from "big.js"
import type { HyperliquidFill } from "@/backend/hyperliquid/info"

export const SIMULATED_MARKETS: Record<string, number> = {
  "io:ANTH": 1796.75,
  "io:OAI": 1444.75,
  "io:NVDA": 207.485,
  "io:IONQ": 30.664,
  "io:SNDK": 1269.95,
  "io:NBIS": 159.135,
  "io:EWY": 154.165,
  "io:GPRO": 0.98754,
  "io:DRAM": 48.8885,
  "io:PRL": 1.55155,
  "io:TCNT": 48.106,
  "io:XIAOMI": 3.2897,
}

export const MIN_NOTIONAL = 500
export const MAX_NOTIONAL = 50000
export const TAKER_FEE_RATE = "0.00009"
export const MAKER_REBATE_RATE = "0.00001"
export const MAKER_CHANCE = 0.1

const PRICE_JITTER = 0.01
const PRICE_SIG_FIGS = 5
const DIRECTIONS = ["Open Long", "Open Short", "Close Long", "Close Short"] as const

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))]
}

function randomHex(length: number, random: () => number): string {
  let out = ""
  for (let index = 0; index < length; index++) out += Math.floor(random() * 16).toString(16)
  return out
}

function sizeDecimals(price: Big): number {
  return price.gte(1000) ? 3 : price.gte(10) ? 2 : price.gte(1) ? 1 : 0
}

export function buildSimulatedFill(random: () => number, now: number): HyperliquidFill {
  const coin = pick(Object.keys(SIMULATED_MARKETS), random)
  const mid = SIMULATED_MARKETS[coin]
  const price = new Big(mid * (1 + (random() * 2 - 1) * PRICE_JITTER)).prec(PRICE_SIG_FIGS)
  const targetNotional = MIN_NOTIONAL + random() * (MAX_NOTIONAL - MIN_NOTIONAL)
  const size = new Big(targetNotional).div(price).round(sizeDecimals(price), Big.roundDown)
  const notional = price.times(size)
  const maker = random() < MAKER_CHANCE
  const fee = maker
    ? notional.times(MAKER_REBATE_RATE).times(-1).round(6, Big.roundHalfUp)
    : notional.times(TAKER_FEE_RATE).round(6, Big.roundHalfUp)
  const direction = pick(DIRECTIONS, random)

  return {
    coin,
    px: price.toFixed(),
    sz: size.toFixed(),
    side: direction.endsWith("Long") === direction.startsWith("Open") ? "B" : "A",
    time: now,
    hash: `0x${randomHex(64, random)}`,
    tid: now * 1000 + Math.floor(random() * 1000),
    fee: fee.toFixed(),
    feeToken: "USDC",
    crossed: !maker,
    dir: direction,
  }
}
