"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { humane } from "@/components/onboarding/humane-font"
import { formatCount, formatExactUsd, formatPercent, formatUsd, isZero } from "@/lib/referral-site/format"
import type { ReferralsResponse } from "@/lib/referral-site/types"
import { cn } from "@/lib/utils"
import { MarketPass } from "./market-passes"
import { boostedMarkets, formatMonthDay, marketChoice, marketName } from "./passes"

const TEXT = "text-[0.9375rem] leading-[1.5] text-ink-quiet"

const CHEVRON =
  "grid size-7 place-items-center rounded-full text-ink-quiet outline-none transition-colors duration-200 ease-out hover:bg-panel-2 hover:text-ink focus-visible:text-ink focus-visible:ring-1 focus-visible:ring-ink-quiet"

function BoostCallout({ data, onSelect }: { data: ReferralsResponse; onSelect: (id: string) => void }) {
  const boosts = boostedMarkets(data.markets)
  const [pickedCoin, setPickedCoin] = useState<string | null>(null)
  if (boosts.length === 0) return null
  const found = boosts.findIndex((market) => market.coin === pickedCoin)
  const index = found === -1 ? 0 : found
  const current = boosts[index]
  const behind = [1, 2]
    .filter((offset) => offset < boosts.length)
    .map((offset) => boosts[(index + offset) % boosts.length])
  const several = boosts.length > 1
  const step = (delta: number) => setPickedCoin(boosts[(index + delta + boosts.length) % boosts.length].coin)
  return (
    <div data-tour="boost" className="market-boost w-full text-[0.8125rem] leading-[1.4] text-ink-quiet">
      <div className="market-boost-row">
        <span className="market-boost-deck relative shrink-0">
          {behind
            .map((market, depth) => (
              <span
                key={market.coin}
                inert
                aria-hidden="true"
                className="market-boost-back"
                data-depth={depth + 1}
              >
                <MarketPass choice={marketChoice(market)} selected={false} onSelect={onSelect} />
              </span>
            ))
            .reverse()}
          <span key={current.coin} className="market-boost-front">
            <MarketPass choice={marketChoice(current)} selected={false} onSelect={onSelect} />
          </span>
        </span>
        <span className="market-boost-copy relative grid min-w-0 flex-1">
          {boosts.map((market, position) => {
            const name = marketName(market)
            const active = position === index
            return (
              <span
                key={market.coin}
                aria-hidden={!active}
                inert={!active}
                className={cn(
                  "flex min-w-0 flex-col justify-between [grid-area:1/1] transition-opacity duration-200 ease-out motion-reduce:transition-none",
                  active ? "opacity-100" : "invisible opacity-0",
                )}
              >
                <span className="text-pretty">
                  <span className="text-ink">{name}</span> is boosted to{" "}
                  <span className="text-ink">{formatPercent(market.rate)}</span> until{" "}
                  <span className="whitespace-nowrap">{formatMonthDay(market.boostUntil ?? "")}.</span>
                </span>
                <span className={cn("flex min-w-0", several && "pr-[3.5rem]")}>
                  <button
                    type="button"
                    aria-label={`Share your ${name} pass`}
                    onClick={() => onSelect(market.symbol)}
                    className="group min-w-0 rounded-sm text-left text-ink underline decoration-ink-ghost underline-offset-[0.3em] outline-none transition-colors duration-200 ease-out hover:decoration-ink focus-visible:ring-1 focus-visible:ring-ink-quiet"
                  >
                    Share this pass{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </button>
                </span>
              </span>
            )
          })}
          {several ? (
            <span className="absolute bottom-0 right-0 -mr-1.5 -mb-[0.1rem] flex items-center">
              <button
                type="button"
                aria-label="Previous boosted market"
                onClick={() => step(-1)}
                className={CHEVRON}
              >
                <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next boosted market"
                onClick={() => step(1)}
                className={CHEVRON}
              >
                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
            </span>
          ) : null}
        </span>
      </div>
    </div>
  )
}

function Amount({ value }: { value: string }) {
  const point = value.indexOf(".")
  if (point === -1) return <>{value}</>
  return (
    <>
      {value.slice(0, point)}
      <span className="text-ink-quiet">{value.slice(point)}</span>
    </>
  )
}

export function Earnings({
  data,
  onSelect,
  className,
}: {
  data: ReferralsResponse
  onSelect: (id: string) => void
  className?: string
}) {
  const { referredCount, tradingCount, earnedUsd } = data.totals
  const zero = isZero(earnedUsd)
  const shown = zero ? "$0" : formatUsd(earnedUsd)
  const fit = `min(10rem, ${(100 / (shown.length * 0.25)).toFixed(2)}cqi)`
  return (
    <section
      data-tour="earnings"
      aria-label="Your earnings"
      className={cn("@container flex min-w-0 flex-col", className)}
    >
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-quiet">
        You&rsquo;ve earned
      </span>
      <p
        title={formatExactUsd(earnedUsd)}
        className={cn(
          "mt-5 whitespace-nowrap font-bold leading-[0.8] tabular-nums",
          zero ? "text-ink-quiet" : "text-ink",
        )}
        style={{ fontFamily: humane.style.fontFamily, fontSize: fit }}
      >
        {zero ? shown : <Amount value={shown} />}
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <p className={TEXT}>
          {referredCount === 0 ? (
            "Nobody has joined yet"
          ) : tradingCount === 0 ? (
            "from your friends once they trade"
          ) : (
            <>
              from <span className="text-ink">{formatCount(tradingCount)}</span>{" "}
              {tradingCount === 1 ? "friend" : "friends"}
            </>
          )}
        </p>
        <BoostCallout data={data} onSelect={onSelect} />
      </div>
    </section>
  )
}
