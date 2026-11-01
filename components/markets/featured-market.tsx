import { ArrowRight, Flame, Star } from "lucide-react"
import Link from "next/link"
import { formatMarketPrice } from "@/lib/markets/format"
import { marketTitle, tradeHref, type MarketRow } from "@/lib/markets/market-rows"
import { cn } from "@/lib/utils"
import { ChangeText } from "./change-text"
import { MarketLogo } from "./market-logo"
import { MarketSparkline } from "./market-sparkline"

export function FeaturedMarket({
  row,
  label,
  description,
  isFeatured,
  isAnimated,
}: {
  row: MarketRow
  label: string
  description: string | null
  isFeatured: boolean
  isAnimated: boolean
}) {
  const { market } = row
  const title = marketTitle(market)
  const up = (row.change ?? 0) >= 0

  return (
    <section
      className={cn(
        "entropy-card rounded-[0.625rem]",
        isAnimated && "lite-carousel-slide",
        "relative flex flex-col overflow-hidden p-5",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-24 -top-24 size-80 rounded-full blur-3xl",
          up ? "bg-up/15" : "bg-down/15",
        )}
      />
      <span className="relative flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-soft">
        {isFeatured ? (
          <Star
            size="0.9375rem"
            aria-hidden="true"
            fill="currentColor"
            className="text-[var(--entropy-orange)]"
          />
        ) : (
          <Flame size="0.9375rem" aria-hidden="true" className="text-[var(--entropy-orange)]" />
        )}
        {label}
      </span>
      <div className="relative mt-4 flex items-center gap-4">
        <MarketLogo market={market} className="size-16 rounded-[1rem] text-[1.25rem]" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="truncate text-[2rem] font-semibold leading-none tracking-[-0.04em]">{title}</span>
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-[1.375rem] font-medium tabular-nums tracking-[-0.04em] text-ink">
              {formatMarketPrice(row.price, market.szDecimals)}
            </span>
            <ChangeText change={row.change} className="text-[0.825rem]" />
            <span className="text-[0.8125rem] text-ink-quiet">today</span>
          </span>
        </div>
      </div>
      <p className="relative mt-4 line-clamp-2 min-h-[2.9rem] max-w-[44rem] text-[0.9375rem] leading-[1.55] text-ink-soft">
        {description}
      </p>
      <MarketSparkline
        coin={market.name}
        up={up}
        price={row.price}
        className="relative -mx-5 mt-auto h-36 w-[calc(100%+2.5rem)] shrink-0 pt-4"
      />
      <div className="relative mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={tradeHref(market.name)}
          className="lite-primary inline-flex h-11 items-center gap-2 rounded-[0.625rem] px-5 text-[0.9375rem]"
        >
          Trade {title}
          <ArrowRight size="1rem" aria-hidden="true" />
        </Link>
        {market.maxLeverage ? (
          <span className="text-[0.8125rem] text-ink-quiet">
            Up to <span className="font-semibold text-ink">{market.maxLeverage}×</span> multiplier
          </span>
        ) : null}
      </div>
    </section>
  )
}
