"use client"

import { useState } from "react"
import { marketLogoSrc } from "@/lib/assets"
import { marketSymbol } from "@/lib/trade/markets"
import { cn } from "@/lib/utils"

const VARIANT_CLASS = {
  header: "text-[0.8125rem] h-[2.025rem] w-[2.025rem] rounded-[0.375rem]",
  option: "h-5 w-5 text-[0.5625rem]",
} as const

type MarketLogoProps = { coin: string; variant: keyof typeof VARIANT_CLASS }

export function MarketLogo({ coin, variant }: MarketLogoProps) {
  const [failedCoin, setFailedCoin] = useState<string | null>(null)
  const symbol = marketSymbol(coin)
  const failed = failedCoin === coin

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden font-serif",
        variant === "option" && "rounded-full",
        failed ? "bg-panel-3" : "bg-transparent",
        VARIANT_CLASS[variant],
      )}
    >
      {failed ? (
        <span className="font-medium text-ink">{symbol.slice(0, 2)}</span>
      ) : (
        <img
          alt={symbol}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          src={marketLogoSrc(coin)}
          onError={() => setFailedCoin(coin)}
        />
      )}
    </div>
  )
}
