import { Skeleton } from "@/components/ui/skeleton"
import type { MarketRow } from "@/lib/markets/market-rows"
import { MoverCard } from "./mover-card"
import { SegmentedToggle, type SegmentOption } from "./segmented-toggle"

export type MoverSide = "gainers" | "losers"

const SIDES: SegmentOption<MoverSide>[] = [
  { value: "gainers", label: "Gainers" },
  { value: "losers", label: "Losers" },
]

const PLACEHOLDER_COUNT = 5

export function TopMovers({
  side,
  onSideChange,
  rows,
}: {
  side: MoverSide
  onSideChange: (side: MoverSide) => void
  rows: MarketRow[]
}) {
  return (
    <section className="entropy-card rounded-[0.625rem] flex flex-col gap-3 p-3">
      <div className="flex items-center gap-3 px-1">
        <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">Top Movers</h2>
        <SegmentedToggle options={SIDES} value={side} onChange={onSideChange} className="ml-auto" />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {rows.length
          ? rows.map((row) => <MoverCard key={row.market.name} row={row} />)
          : Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
              <Skeleton key={index} className="block h-[11.5rem] rounded-[0.75rem] bg-ink/10" />
            ))}
      </div>
    </section>
  )
}
