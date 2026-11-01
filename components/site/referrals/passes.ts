import Big from "big.js"
import type { PassLock } from "./pass/pass"
import { skinFor } from "./pass/skins"
import type { Skin, TicketState } from "./pass/skins/types"
import { TRADE_URL } from "@/lib/referral-site/config"
import { formatPercent } from "@/lib/referral-site/format"
import { UNLOCKED_RATE } from "@/lib/referral-site/market-programs"
import type { DecimalString, ReferralMarket } from "@/lib/referral-site/types"

export type PassChoice = {
  id: string
  symbol: string
  skin?: Skin
  state: TicketState
  rate: DecimalString
  market?: ReferralMarket
}

export const MAIN_ID = "main"

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export function formatMonthDay(iso: string): string {
  return monthDay.format(new Date(iso))
}

export function shortUsd(value: DecimalString | number): string {
  const amount = Number(value)
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1).replace(/\.0$/, "")}K`
  return `$${Math.round(amount)}`
}

export function progressOf(market: ReferralMarket): number {
  const goal = Number(market.unlockVolumeUsd)
  if (goal <= 0) return 1
  return Math.min(Number(market.ownVolumeUsd) / goal, 1)
}

export function buildChoices(markets: ReferralMarket[], referrerShare: DecimalString): PassChoice[] {
  const rank: Record<TicketState, number> = { boosted: 0, unlocked: 1, locked: 2 }
  const sorted = [...markets].sort((a, b) => {
    if (a.state !== b.state) return rank[a.state] - rank[b.state]
    if (a.state === "locked")
      return new Big(b.ownVolumeUsd)
        .div(b.unlockVolumeUsd)
        .cmp(new Big(a.ownVolumeUsd).div(a.unlockVolumeUsd))
    return 0
  })
  const main: PassChoice = { id: MAIN_ID, symbol: "Main", state: "unlocked", rate: referrerShare }
  return [main, ...sorted.map(marketChoice)]
}

export function marketChoice(market: ReferralMarket): PassChoice {
  return {
    id: market.symbol,
    symbol: market.symbol,
    skin: skinFor(market.symbol),
    state: market.state,
    rate: market.rate,
    market,
  }
}

export function shownRate(choice: PassChoice): string {
  return formatPercent(choice.state === "locked" ? UNLOCKED_RATE : choice.rate)
}

export function marketName(market: ReferralMarket): string {
  return skinFor(market.symbol)?.name ?? market.symbol
}

export function choiceName(choice: PassChoice): string {
  return choice.market ? marketName(choice.market) : "Main"
}

function unlockGap(market: ReferralMarket): string {
  return shortUsd(new Big(market.unlockVolumeUsd).minus(market.ownVolumeUsd).toString())
}

export function explain(choice: PassChoice): string {
  const { market } = choice
  if (!market)
    return `You get ${formatPercent(choice.rate)} of the fees Entropy makes on your friends' io trades.`
  const name = marketName(market)
  const rate = formatPercent(market.rate)
  if (market.state === "boosted" && market.boostUntil) {
    return `Entropy boosted ${name}. You get ${rate} of the fees Entropy makes on every friend's ${name} trades until ${formatMonthDay(market.boostUntil)}.`
  }
  if (market.state === "unlocked") {
    const since = market.unlockedAt ? `Unlocked ${formatMonthDay(market.unlockedAt)}.` : "Unlocked."
    return `${since} You get ${rate} of the fees Entropy makes on ${name} trades by friends who joined since.`
  }
  return `Trade ${unlockGap(market)} more ${name}. Then you get ${formatPercent(UNLOCKED_RATE)} of the fees Entropy makes on ${name} trades by friends who join after that.`
}

export function caption(choice: PassChoice): string {
  const { market } = choice
  if (!market) return "Every io market"
  if (market.state === "boosted" && market.boostUntil)
    return `Boost ends ${formatMonthDay(market.boostUntil)}`
  if (market.state === "unlocked") return "Unlocked"
  return `${shortUsd(market.ownVolumeUsd)} of ${shortUsd(market.unlockVolumeUsd)}`
}

export function cutNote(choice: PassChoice): string {
  const { market } = choice
  if (!market) return "of Entropy's fees on your friends' io trades"
  const name = marketName(market)
  if (market.state === "boosted" && market.boostUntil) {
    return `of Entropy's fees on every friend's ${name} trades until ${formatMonthDay(market.boostUntil)}`
  }
  if (market.state === "unlocked")
    return `of Entropy's fees on ${name} trades by friends who join from now on`
  return `of Entropy's fees on ${name} trades by friends who join after you unlock`
}

function boostEnd(market: ReferralMarket): number {
  return market.state === "boosted" && market.boostUntil
    ? Date.parse(market.boostUntil)
    : Number.POSITIVE_INFINITY
}

export function boostedMarkets(markets: ReferralMarket[]): ReferralMarket[] {
  return markets
    .filter((market) => market.state === "boosted" && market.boostUntil)
    .sort((a, b) => boostEnd(a) - boostEnd(b))
}

export function lockOf(choice: PassChoice): PassLock | undefined {
  const { market } = choice
  if (!market || market.state !== "locked") return undefined
  const name = marketName(market)
  return {
    note: `Trade ${unlockGap(market)} more ${name} to unlock this pass`,
    progress: progressOf(market),
    href: `${TRADE_URL}/${market.coin}`,
    cta: `Trade ${name} on Entropy`,
    status: `${shortUsd(market.ownVolumeUsd)} of ${shortUsd(market.unlockVolumeUsd)}`,
  }
}
