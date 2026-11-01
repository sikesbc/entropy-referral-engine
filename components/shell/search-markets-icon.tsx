"use client"

import { useState } from "react"
import { localAssetUrl, marketLogoSrc } from "@/lib/assets"
import type { Market } from "@/lib/api/types/markets"
import { cn } from "@/lib/utils"
import { marketTicker } from "./search-markets-format"

const SIZE_CLASS = {
  md: "h-7 w-7 text-[0.6875rem]",
  lg: "h-9 w-9 text-[0.8125rem]",
} as const

export function SearchMarketsIcon({ market, size }: { market: Market; size: keyof typeof SIZE_CLASS }) {
  const [failed, setFailed] = useState(false)
  const symbol = marketTicker(market.name)
  const src = localAssetUrl(market.assetUrl) ?? marketLogoSrc(market.name)
  const showImage = !failed
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-serif",
        showImage ? "bg-transparent" : "bg-panel-3",
        SIZE_CLASS[size],
      )}
    >
      {showImage ? (
        <img
          alt={symbol}
          loading="lazy"
          decoding="async"
          src={src}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="font-medium text-ink">{symbol.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}
