"use client"

import { useState } from "react"
import type { Market } from "@/lib/api/types/markets"
import { localAssetUrl, marketLogoSrc } from "@/lib/assets"
import { marketSymbol } from "@/lib/markets/market-rows"
import { cn } from "@/lib/utils"

export function MarketLogo({ market, className }: { market: Market; className?: string }) {
  const symbol = marketSymbol(market)
  const src = localAssetUrl(market.assetUrl) ?? marketLogoSrc(market.name)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = failedSrc !== src

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-serif",
        showImage ? "bg-transparent" : "bg-panel-3",
        "h-9 w-9 text-[0.8125rem]",
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={symbol}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="font-medium text-ink">{symbol.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}
