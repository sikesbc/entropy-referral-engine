import { AssetIcon } from "./asset-icon"
import { LeveragePill } from "./leverage-pill"
import type { Market } from "@/lib/api/types/markets"
import { marketDisplayName, symbolBase } from "@/lib/feed/trade-event"

export function AssetSummary({
  symbol,
  side,
  leverage,
  market,
  title,
  detail,
}: {
  symbol: string
  side: string
  leverage: number | null
  market: Market | null
  title?: string
  detail?: string
}) {
  const base = symbolBase(symbol)
  return (
    <span className="flex min-w-0 items-center gap-3">
      <AssetIcon
        symbol={symbol}
        label={base}
        url={market?.assetUrl}
        className="text-[0.8125rem] size-9 shrink-0 rounded-[0.5rem]"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-sans text-[0.9375rem] font-semibold text-ink">
          {title ?? marketDisplayName(symbol, market)}
        </span>
        <span className="flex items-center gap-1.5 font-sans text-[0.75rem]">
          <span className={side === "long" ? "text-up" : "text-down"}>
            {side === "long" ? "Long" : "Short"}
          </span>
          {leverage != null ? <LeveragePill leverage={leverage} /> : null}
          {detail != null ? <span className="font-mono tabular-nums text-ink-soft">{detail}</span> : null}
        </span>
      </span>
    </span>
  )
}
