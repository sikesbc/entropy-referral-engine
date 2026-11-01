import Link from "next/link"
import { formatMarketPrice } from "@/lib/markets/format"
import { marketTitle, tradeHref, type MarketRow } from "@/lib/markets/market-rows"
import { ChangeText } from "./change-text"
import { MarketLogo } from "./market-logo"
import { MarketSparkline } from "./market-sparkline"

export function MoverCard({ row }: { row: MarketRow }) {
  const { market } = row
  const up = (row.change ?? 0) >= 0

  return (
    <Link
      href={tradeHref(market.name)}
      className="group relative flex flex-col overflow-hidden rounded-[0.75rem] bg-panel-2 p-3 transition-transform duration-150 hover:-translate-y-0.5 dark:bg-panel-3"
    >
      <div className="flex items-center gap-2.5">
        <MarketLogo market={market} className="size-10 rounded-[0.625rem]" />
        <span className="min-w-0 truncate text-[0.9375rem] font-semibold">{marketTitle(market)}</span>
      </div>
      <ChangeText change={row.change} className="mt-3 text-[1.5rem] leading-none" />
      <span className="mt-1 font-mono text-[0.8125rem] tabular-nums text-ink-soft">
        {formatMarketPrice(row.price, market.szDecimals)}
      </span>
      <MarketSparkline
        coin={market.name}
        up={up}
        price={row.price}
        className="-mx-3 -mb-3 mt-2 h-14 w-[calc(100%+1.5rem)]"
      />
    </Link>
  )
}
