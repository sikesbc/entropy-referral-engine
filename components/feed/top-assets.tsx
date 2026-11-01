import Link from "next/link"
import { AssetIcon } from "./asset-icon"
import type { TopTraderPosition } from "@/lib/api/types/discovery"
import { marketDisplayName, marketTradePath, symbolBase, type MarketMap } from "@/lib/feed/trade-event"
import { cn } from "@/lib/utils"

export function TopAssets({
  positions,
  positionCount,
  markets,
}: {
  positions: TopTraderPosition[]
  positionCount: number
  markets: MarketMap
}) {
  if (!positions.length) return <span className="text-[0.75rem] text-ink-quiet">—</span>
  return (
    <span className="flex items-center">
      {positions.map((position, index) => {
        const market = markets.get(position.symbol)
        const name = marketDisplayName(position.symbol, market)
        const ringClass = cn("inline-flex rounded-full ring-2 ring-panel", index > 0 && "-ml-1.5")
        const icon = (
          <AssetIcon
            symbol={position.symbol}
            label={symbolBase(position.symbol)}
            url={market?.assetUrl}
            className="text-[0.5625rem] size-7 rounded-full"
          />
        )
        return market ? (
          <Link
            key={position.symbol}
            href={marketTradePath(market)}
            onClick={(event) => event.stopPropagation()}
            title={`${name} ${position.side}`}
            aria-label={`Trade ${name}`}
            className={cn(ringClass, "transition-transform hover:z-10 hover:-translate-y-0.5")}
          >
            {icon}
          </Link>
        ) : (
          <span key={position.symbol} title={`${name} ${position.side}`} className={ringClass}>
            {icon}
          </span>
        )
      })}
      {positionCount > positions.length ? (
        <span className="ml-1.5 font-mono text-[0.6875rem] text-ink-quiet">
          +{positionCount - positions.length}
        </span>
      ) : null}
    </span>
  )
}
