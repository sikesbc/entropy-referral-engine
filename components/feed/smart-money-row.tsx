import Link from "next/link"
import { AssetIcon } from "./asset-icon"
import type { SmartMoneyAsset } from "@/lib/api/types/discovery"
import type { Market } from "@/lib/api/types/markets"
import { formatFeedUsd } from "@/lib/feed/format"
import { marketDisplayName, marketTradePath, symbolBase } from "@/lib/feed/trade-event"
import { cn } from "@/lib/utils"

export function SmartMoneyRow({ asset, market }: { asset: SmartMoneyAsset; market: Market | null }) {
  const name = marketDisplayName(asset.symbol, market)
  const longShare = asset.longTraders / (asset.longTraders + asset.shortTraders)
  const isLong = longShare >= 0.5
  const label = <span className="truncate text-[0.875rem] font-medium text-ink">{name}</span>
  return (
    <li className="flex flex-col gap-2">
      <span className="flex items-center gap-2.5">
        <AssetIcon
          symbol={asset.symbol}
          label={symbolBase(asset.symbol)}
          url={market?.assetUrl}
          className="text-[0.5625rem] size-6 shrink-0 rounded-full"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          {market ? (
            <Link href={marketTradePath(market)} className="flex min-w-0 hover:underline">
              {label}
            </Link>
          ) : (
            label
          )}
          <span className="text-[0.75rem] text-ink-quiet">
            {asset.longTraders} long · {asset.shortTraders} short
          </span>
        </span>
        <span className="flex flex-col items-end">
          <span className={cn("font-mono text-[0.8125rem] tabular-nums", isLong ? "text-up" : "text-down")}>
            {Math.round((isLong ? longShare : 1 - longShare) * 100)}% {isLong ? "long" : "short"}
          </span>
          <span className="font-mono text-[0.75rem] tabular-nums text-ink-quiet">
            {formatFeedUsd(asset.totalUsd)}
          </span>
        </span>
      </span>
      <span aria-hidden="true" className="ml-[2.125rem] flex h-1.5 gap-0.5">
        {asset.longTraders > 0 ? (
          <span className="rounded-full bg-up" style={{ flexGrow: asset.longTraders }} />
        ) : null}
        {asset.shortTraders > 0 ? (
          <span className="rounded-full bg-down" style={{ flexGrow: asset.shortTraders }} />
        ) : null}
      </span>
    </li>
  )
}
