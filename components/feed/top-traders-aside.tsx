"use client"

import { PopularLeadersSection } from "./popular-leaders-section"
import { SmartMoneySection } from "./smart-money-section"
import { usePopularLeaders } from "@/lib/api/discovery"
import type { FeedTrader, MarketMap } from "@/lib/feed/trade-event"

export function TopTradersAside({
  markets,
  onSelectTrader,
}: {
  markets: MarketMap
  onSelectTrader: (trader: FeedTrader) => void
}) {
  const leaders = usePopularLeaders()
  return (
    <aside
      aria-label="Top traders"
      className="entropy-card rounded-[0.625rem] flex min-w-0 flex-col gap-7 p-5 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:none]"
    >
      <SmartMoneySection markets={markets} />
      <PopularLeadersSection
        title="Most copied"
        leaders={leaders.data?.copied ?? null}
        isLoading={leaders.isPending}
        countLabel={["copier", "copiers"]}
        onSelectTrader={onSelectTrader}
      />
      <PopularLeadersSection
        title="Most countertraded"
        leaders={leaders.data?.countered ?? null}
        isLoading={leaders.isPending}
        countLabel={["countertrader", "countertraders"]}
        onSelectTrader={onSelectTrader}
      />
    </aside>
  )
}
