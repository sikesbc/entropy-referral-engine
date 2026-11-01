import type { Market } from "@/lib/api/types/markets"
import { MarketPicker } from "./market-picker"
import { PriceChange } from "./price-change"
import { RollingPrice } from "./rolling-price"

type MarketHeaderProps = {
  coin: string
  market: Market | null
  markets: Market[]
  price: number | null
  decimals: number
  change: number | null
  periodLabel: string
}

export function MarketHeader({
  coin,
  market,
  markets,
  price,
  decimals,
  change,
  periodLabel,
}: MarketHeaderProps) {
  return (
    <div className="px-3 pt-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <MarketPicker coin={coin} market={market} markets={markets} />
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <div
            className="flex h-[3.25rem] items-baseline font-mono text-[3rem] font-medium leading-none tabular-nums tracking-[-0.042em] text-ink"
            aria-live="off"
          >
            {price !== null ? <RollingPrice value={price} decimals={decimals} /> : null}
          </div>
          {price !== null && change !== null ? (
            <PriceChange change={change} reference={price - change} periodLabel={periodLabel} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
