import Link from "next/link"
import { formatMarketVolume } from "@/lib/markets/format"
import { tradeHref, type MarketRow } from "@/lib/markets/market-rows"
import { ChangeText } from "./change-text"
import { MarketIdentity } from "./market-identity"

export function MostTraded({
  title,
  rows,
  isLoading,
}: {
  title: string
  rows: MarketRow[]
  isLoading: boolean
}) {
  return (
    <section className="entropy-card rounded-[0.625rem] flex flex-col p-3">
      <h2 className="px-1 pb-2 pt-1 text-[1.25rem] font-semibold tracking-[-0.02em]">{title}</h2>
      <ol className="flex flex-1 flex-col justify-between">
        {rows.map((row, index) => (
          <li key={row.market.name}>
            <Link
              href={tradeHref(row.market.name)}
              className="flex items-center gap-3 rounded-[0.5rem] px-1 py-2 transition-colors hover:bg-ink/6 dark:hover:bg-ink/12"
            >
              <span className="w-4 shrink-0 font-mono text-[0.8125rem] font-semibold text-ink-quiet">
                {index + 1}
              </span>
              <MarketIdentity market={row.market} />
              <span className="ml-auto flex shrink-0 flex-col items-end gap-0.5">
                <span className="font-mono text-[0.9375rem] font-semibold tabular-nums text-ink">
                  {formatMarketVolume(row.volume)}
                </span>
                <ChangeText change={row.change} className="text-[0.75rem]" />
              </span>
            </Link>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="px-1 py-6 text-center text-ink-quiet">
            {isLoading ? "Loading…" : "Nothing yet today"}
          </li>
        ) : null}
      </ol>
    </section>
  )
}
