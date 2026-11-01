"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { usePrivy } from "@privy-io/react-auth"
import { replayIntro } from "@/components/referrals/intro/intro-store"
import { skinFor } from "@/components/site/referrals/pass/skins"
import {
  absDecimal,
  formatMarket,
  formatPercent,
  formatRoundedUsd,
  formatUsd,
  isNegative,
} from "@/lib/referral-site/format"
import type { MarketDemoAction } from "@/lib/referral-site/mock-api"
import type { AddedReferralResponse, ReferralMarket, SimulatedTradeResponse } from "@/lib/referral-site/types"

type SimulateAction = "add_referral" | "trade"
type DemoAction = SimulateAction | MarketDemoAction

const ACTION_LABELS: Record<DemoAction, string> = {
  add_referral: "Add a friend",
  trade: "Simulate a trade",
  unlock: "Unlock a ticket",
  boost: "Start a boost",
  end_boosts: "End boosts",
}

const LIVE_ACTIONS: DemoAction[] = ["add_referral", "trade", "unlock", "boost", "end_boosts"]
const MARKET_ACTIONS: MarketDemoAction[] = ["unlock", "boost", "end_boosts"]
const BOOSTS_ENDED = "Boosts ended."

const ERROR_MESSAGES: Record<string, string> = {
  no_simulated_referees: "Add a friend first.",
  no_locked_market: "Every market is already unlocked or boosted.",
  no_unboosted_market: "Every market is already boosted.",
  not_registered: "Sign up first.",
  unauthorized: "Sign in first.",
}

const BUTTON_CLASS =
  "inline-flex h-7 items-center whitespace-nowrap rounded-full px-3 text-[0.8125rem] text-ink-soft ring-1 ring-inset ring-line-soft transition-colors hover:text-ink hover:ring-line disabled:cursor-progress disabled:text-ink-quiet"

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

function tradeMessage(trade: SimulatedTradeResponse): string {
  const traded = `${trade.username} traded ${formatRoundedUsd(trade.notionalUsd, 0)} of ${formatMarket(trade.coin)}`
  if (isNegative(trade.feeUsd)) {
    return `${traded}, received a ${formatUsd(absDecimal(trade.feeUsd))} rebate, you earned nothing`
  }
  return `${traded}, paid ${formatUsd(trade.feeUsd)}, you earned ${formatUsd(trade.earnedUsd)}`
}

export function marketMessage(market: ReferralMarket | null): string {
  if (!market) return ERROR_MESSAGES.no_locked_market
  if (market.state === "boosted" && market.boostUntil) {
    const name = skinFor(market.symbol)?.name ?? market.symbol
    return `${name} boosted to ${formatPercent(market.rate)} until ${monthDay.format(new Date(market.boostUntil))}.`
  }
  return `${market.symbol} unlocked. You get ${formatPercent(market.rate)} of the fees Entropy makes on ${market.symbol} trades by friends who join from now on.`
}

function successMessage(action: DemoAction, body: unknown): string | null {
  if (action === "add_referral")
    return `${(body as AddedReferralResponse).username} signed up with your link.`
  if (action === "trade") return tradeMessage(body as SimulatedTradeResponse)
  if (action === "end_boosts") return BOOSTS_ENDED
  return marketMessage((body as { market: ReferralMarket }).market)
}

function endpointFor(action: DemoAction): string {
  return action === "add_referral" || action === "trade" ? "/api/demo/simulate" : "/api/site/demo-markets"
}

function ReplayIntroButton() {
  return (
    <button type="button" className={BUTTON_CLASS} onClick={() => replayIntro()}>
      Replay intro
    </button>
  )
}

function Toolbar<A extends DemoAction>({
  actions,
  pending,
  message,
  onRun,
}: {
  actions: A[]
  pending: A | null
  message: string | null
  onRun: (action: A) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-[80rem] flex-wrap items-center gap-2 border-t border-line-soft px-5 py-5 sm:px-12">
      <span className="mr-3 flex flex-col gap-1">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-quiet">
          Reviewer tools · demo only
        </span>
        <span className="text-[0.75rem] text-ink-quiet">Real users never see this.</span>
      </span>
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          className={BUTTON_CLASS}
          disabled={pending !== null}
          aria-busy={pending === action}
          onClick={() => onRun(action)}
        >
          {ACTION_LABELS[action]}
        </button>
      ))}
      <ReplayIntroButton />
      {message ? (
        <span role="status" className="ml-1 text-[0.8125rem] text-ink-quiet">
          {message}
        </span>
      ) : null}
      <p className="w-full pt-2 text-[0.75rem] text-ink-quiet">
        I did not add a resend api key so the emails won&apos;t send, but if one is added, it will work
      </p>
    </div>
  )
}

function LiveDemoTools() {
  const { getAccessToken } = usePrivy()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [pending, setPending] = useState<DemoAction | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function run(action: DemoAction) {
    setPending(action)
    setMessage(null)
    try {
      const token = await getAccessToken()
      const response = await fetch(endpointFor(action), {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ action }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        setMessage(ERROR_MESSAGES[body.error ?? ""] ?? "Something went wrong.")
        return
      }
      const body: unknown = await response.json().catch(() => null)
      setMessage(body ? successMessage(action, body) : null)
      await queryClient.invalidateQueries({ queryKey: ["site", "referrals"] })
      router.refresh()
    } catch {
      setMessage("Something went wrong.")
    } finally {
      setPending(null)
    }
  }

  return (
    <Toolbar
      actions={LIVE_ACTIONS}
      pending={pending}
      message={message}
      onRun={(action) => void run(action)}
    />
  )
}

export function DemoMarketTools({
  onAction,
}: {
  onAction: (action: MarketDemoAction) => ReferralMarket | null
}) {
  const [message, setMessage] = useState<string | null>(null)
  return (
    <Toolbar
      actions={MARKET_ACTIONS}
      pending={null}
      message={message}
      onRun={(action) => {
        const market = onAction(action)
        setMessage(action === "end_boosts" ? BOOSTS_ENDED : marketMessage(market))
      }}
    />
  )
}

export function DemoTools() {
  if (process.env.NEXT_PUBLIC_DEMO_TOOLS !== "1") return null
  return <LiveDemoTools />
}
