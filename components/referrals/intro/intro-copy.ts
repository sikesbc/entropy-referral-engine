import Big from "big.js"
import { ENTROPY_SHARE, REFERRER_SHARE } from "@/lib/referral-site/config"
import { formatPercent, formatRoundedUsd } from "@/lib/referral-site/format"
import { BOOST_RATE, UNLOCK_VOLUME_USD, UNLOCKED_RATE } from "@/lib/referral-site/market-programs"

const BASE = formatPercent(REFERRER_SHARE)
const UNLOCKED = formatPercent(UNLOCKED_RATE)
const BOOSTED = formatPercent(BOOST_RATE)
const UNLOCK = formatRoundedUsd(String(UNLOCK_VOLUME_USD), 0).replace(/,000$/, "K")

export const EXAMPLE_TRADE_USD = "10000"
export const EXAMPLE_FEE_USD = "0.9"

const EXAMPLE_ENTROPY = new Big(EXAMPLE_FEE_USD).times(ENTROPY_SHARE)
const EXAMPLE_YOURS = EXAMPLE_ENTROPY.times(REFERRER_SHARE)

const HALF = REFERRER_SHARE === "0.5" ? "half" : `${BASE} of`

export const INTRO_COPY = {
  ticket: { title: "Share your link.", text: "Friends who sign up through it are yours." },
  friends: {
    title: "You earn when they trade.",
    text: `You get ${HALF} the fees Entropy makes on their io trades.`,
  },
  markets: {
    title: "Earn more on new referrals.",
    text: `Trade ${UNLOCK} of a market yourself. Then you get ${UNLOCKED} of the fees Entropy makes on that market’s trades by friends who join later.`,
  },
  boost: {
    title: "Look out for boosts.",
    text: `When Entropy boosts a market, you get ${BOOSTED} of the fees Entropy makes on every friend’s trades there until the boost ends.`,
  },
  firstShare: { title: "Ready? Send your pass to your first friend." },
  shareAgain: { title: "Share your pass again." },
} as const

export const INTRO_SHARE_DISMISS = "Not now"
export const INTRO_SHARE_NOW = "Share now"

export const INTRO_ASK_COPY = {
  title: "Want a ping when you can earn more?",
  text: "We’ll email you when Entropy boosts a market or you unlock a new one.",
  success: "You’re on the list.",
  error: "Couldn’t save that. Try again.",
  dismiss: "Not now",
} as const

export const INTRO_WORKED_LINE = `Maya trades ${formatRoundedUsd(EXAMPLE_TRADE_USD, 0)} → Entropy makes ${formatRoundedUsd(EXAMPLE_ENTROPY.toFixed())} → you get ${formatRoundedUsd(EXAMPLE_YOURS.toFixed())}`

export const INTRO_SENTENCES = [INTRO_COPY.ticket.title, INTRO_COPY.friends.title, INTRO_COPY.markets.title]

export const PANEL_STEPS: readonly { title: string; text: string }[] = [
  { title: INTRO_COPY.ticket.title, text: INTRO_COPY.ticket.text },
  { title: INTRO_COPY.friends.title, text: "You get part of the fees Entropy makes on their io trades." },
  {
    title: INTRO_COPY.markets.title,
    text: `Trade ${UNLOCK} of a market yourself to unlock a higher rate on friends who join after.`,
  },
  {
    title: INTRO_COPY.boost.title,
    text: "When Entropy boosts a market, every friend’s trades there earn the top rate until the end date.",
  },
]

export type PanelRateKind = "base" | "unlocked" | "boosted"

export const PANEL_RATES: readonly { kind: PanelRateKind; rate: string; market: string; friends: string }[] =
  [
    { kind: "base", rate: BASE, market: "Every io market", friends: "All your friends" },
    {
      kind: "unlocked",
      rate: UNLOCKED,
      market: "A market you unlock",
      friends: "Friends who join after the unlock",
    },
    {
      kind: "boosted",
      rate: BOOSTED,
      market: "A boosted market",
      friends: "Every friend, until the end date",
    },
  ]

export const PANEL_RATES_NOTE =
  "Each rate is a share of the fees Entropy makes. When two apply, you get the higher one, because rates never stack."

export const PANEL_EXAMPLE = {
  intro: `You trade ${UNLOCK} of Nvidia, then Maya joins through your link. Later Entropy boosts Anthropic.`,
  trade: `Maya trades ${formatRoundedUsd(EXAMPLE_TRADE_USD, 0)} on each`,
  yours: "You get",
  fee: "Fee on each trade",
  entropy: "Entropy makes",
  rows: [
    { market: "Any other io market", rate: REFERRER_SHARE },
    { market: "Nvidia, unlocked", rate: UNLOCKED_RATE },
    { market: "Anthropic, boosted", rate: BOOST_RATE },
  ],
  outro: `If Maya had joined before your unlock, Nvidia would stay at ${BASE}.`,
} as const

export const PANEL_FAQ: readonly { question: string; answer: string }[] = [
  {
    question: "Which link should I share?",
    answer:
      "Any of your passes, since you have one link and friends count on every market. A market pass only opens that market for them.",
  },
  {
    question: "Do I earn on every market?",
    answer: `On every io market, yes. You get at least ${BASE} of the fees Entropy makes on your friends’ trades there.`,
  },
  {
    question: "How do I unlock a market?",
    answer: `Trade ${UNLOCK} of it yourself. Then you get ${UNLOCKED} there on friends who join after.`,
  },
  {
    question: `What counts toward the ${UNLOCK}?`,
    answer:
      "Add up every trade you've made in that market since you joined. A $2,000 trade counts as $2,000.",
  },
  {
    question: "Does unlocking change what I earn from friends I already have?",
    answer: `No. Friends who joined before the unlock stay at ${BASE} on that market, and past trades get no back pay.`,
  },
  {
    question: "What’s a boost, and how do I hear about one?",
    answer: `Until a set end date, you get ${BOOSTED} of the fees Entropy makes on every friend’s trades in that market. Turn on boost emails in Email settings to hear when one starts.`,
  },
  { question: "How long do I earn from a friend?", answer: "As long as they trade on Entropy." },
  {
    question: "Why don’t I see a friend?",
    answer:
      "They have to sign up through your link before their first trade. A wallet that already traded or already has a referrer can’t join your list.",
  },
  { question: "Can I change my username or link?", answer: "Not yet." },
]

export const PANEL_FINE_PRINT = [
  "Only io markets count.",
  "Only trades after a friend signs up count.",
  "Trades where Entropy makes nothing, like maker rebates, earn nothing.",
  "Your friends’ own referrals don’t count for you.",
  "This demo doesn’t cover payouts.",
]

export const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)"
