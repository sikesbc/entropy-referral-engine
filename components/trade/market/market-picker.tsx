"use client"

import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import type { Market } from "@/lib/api/types/markets"
import { marketHref, marketTicker, matchesMarketQuery } from "@/lib/trade/markets"
import { cn } from "@/lib/utils"
import { LeverageBadge } from "./leverage-badge"
import { MarketLogo } from "./market-logo"

type MarketPickerProps = {
  coin: string
  market: Market | null
  markets: Market[]
}

export function MarketPicker({ coin, market, markets }: MarketPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const name = market?.displayName ?? ""

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  return (
    <h1 data-tour="market" className="min-w-0">
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${name} market, change market`}
          onClick={() => setOpen((current) => !current)}
          className="group flex min-h-[2.3625rem] shrink-0 items-center gap-[0.5625rem] pr-1 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)]"
        >
          <MarketLogo coin={coin} variant="header" />
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="text-[2.295rem] font-medium leading-none tracking-[-0.04em] text-ink transition-colors group-hover:text-[var(--entropy-orange)]">
              {name}
            </span>
            {market ? <LeverageBadge leverage={market.maxLeverage} /> : null}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-4 w-4 shrink-0 text-ink-quiet transition-[color,transform] group-hover:text-[var(--entropy-orange)]",
                open && "rotate-180",
              )}
            />
          </span>
        </button>
        {open ? <MarketPickerPanel coin={coin} markets={markets} onClose={() => setOpen(false)} /> : null}
      </div>
    </h1>
  )
}

type MarketPickerPanelProps = { coin: string; markets: Market[]; onClose: () => void }

function MarketPickerPanel({ coin, markets, onClose }: MarketPickerPanelProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const results = useMemo(
    () => markets.filter((market) => matchesMarketQuery(market, query)),
    [markets, query],
  )

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const select = (market: Market) => {
    onClose()
    if (market.name !== coin) router.push(marketHref(market.name))
  }

  const moveTo = (index: number) => {
    const next = Math.max(0, Math.min(results.length - 1, index))
    setActive(next)
    listRef.current?.children[next]?.scrollIntoView({ block: "nearest" })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") moveTo(active + 1)
    else if (event.key === "ArrowUp") moveTo(active - 1)
    else if (event.key === "Enter" && results[active]) select(results[active])
    else if (event.key === "Escape") onClose()
    else return
    event.preventDefault()
  }

  return (
    <div className="absolute left-0 top-[calc(100%+0.375rem)] z-30 w-[min(21.25rem,calc(100vw-1.5rem))] overflow-hidden rounded-[0.625rem] border border-line-soft bg-panel p-1.5 text-ink shadow-xl">
      <input
        ref={inputRef}
        placeholder="Search markets"
        aria-label="Search markets"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
        onKeyDown={onKeyDown}
        className="h-8 w-full rounded-[0.4375rem] bg-panel-2 px-2.5 text-[0.75rem] font-medium text-ink outline-none placeholder:text-ink-quiet dark:bg-panel-3"
      />
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Markets"
        className="mt-1.5 max-h-[22.5rem] overflow-y-auto"
      >
        {results.map((market, index) => {
          const ticker = marketTicker(market)
          return (
            <li key={market.name} role="option" aria-selected={market.name === coin}>
              <button
                type="button"
                onClick={() => select(market)}
                onPointerMove={() => setActive(index)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-[0.375rem] px-2 py-1.5 text-left text-[0.8125rem] transition-colors",
                  index === active ? "bg-ink/6 text-ink dark:bg-ink/12" : "text-ink-soft",
                )}
              >
                <MarketLogo coin={market.name} variant="option" />
                <span className="truncate font-medium text-ink">{market.displayName}</span>
                {ticker !== market.displayName ? (
                  <span className="shrink-0 text-ink-quiet">{ticker}</span>
                ) : null}
                <LeverageBadge leverage={market.maxLeverage} className="ml-auto" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
