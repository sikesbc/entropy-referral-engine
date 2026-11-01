"use client"

import { AsideSectionHeading } from "./aside-section-heading"
import { SkeletonList } from "./skeleton-list"
import { SmartMoneyRow } from "./smart-money-row"
import { useSmartMoney } from "@/lib/api/discovery"
import type { MarketMap } from "@/lib/feed/trade-event"

const SMART_MONEY_LIMIT = 5

export function SmartMoneySection({ markets }: { markets: MarketMap }) {
  const query = useSmartMoney()
  const assets = query.data?.assets.slice(0, SMART_MONEY_LIMIT) ?? []
  return (
    <section className="flex flex-col gap-2">
      <AsideSectionHeading title="Smart money" />
      {query.isError && !query.data ? (
        <div className="flex items-center gap-3 text-[0.8125rem] text-ink-quiet">
          Couldn’t load positions.
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="inline-flex h-7 items-center rounded-[0.375rem] bg-panel-2 px-3 text-[0.75rem] font-medium text-ink transition-all hover:brightness-95 dark:bg-panel-3"
          >
            Try again
          </button>
        </div>
      ) : query.data ? (
        assets.length ? (
          <ul className="flex flex-col gap-4">
            {assets.map((asset) => (
              <SmartMoneyRow key={asset.symbol} asset={asset} market={markets.get(asset.symbol) ?? null} />
            ))}
          </ul>
        ) : (
          <p className="text-[0.8125rem] text-ink-quiet">No shared positions right now.</p>
        )
      ) : (
        <SkeletonList
          label="Loading positions"
          count={SMART_MONEY_LIMIT}
          className="gap-4"
          itemClassName="h-12 rounded-[0.5rem]"
        />
      )}
    </section>
  )
}
