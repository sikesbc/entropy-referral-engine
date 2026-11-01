import { Flame } from "lucide-react"
import type { Market } from "@/lib/api/types/markets"
import { marketSymbol, marketTitle } from "@/lib/markets/market-rows"
import { LeverageBadge } from "./leverage-badge"
import { MarketLogo } from "./market-logo"

export function MarketIdentity({ market, hot = false }: { market: Market; hot?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <MarketLogo market={market} className="size-9 rounded-[0.5rem]" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-sans text-[0.9375rem] font-semibold text-ink">
            {marketTitle(market)}
          </span>
          {market.maxLeverage ? <LeverageBadge leverage={market.maxLeverage} className="shrink-0" /> : null}
          {hot ? (
            <Flame
              size="0.8125rem"
              aria-label="Hot today"
              className="shrink-0 text-[var(--entropy-orange)]"
            />
          ) : null}
        </span>
        <span className="font-sans text-[0.75rem] text-ink-quiet">{marketSymbol(market)}</span>
      </span>
    </span>
  )
}
