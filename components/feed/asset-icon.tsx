"use client"

import { useState } from "react"
import { localAssetUrl, marketLogoSrc } from "@/lib/assets"
import { cn } from "@/lib/utils"

export function AssetIcon({
  symbol,
  label,
  url,
  className,
}: {
  symbol: string
  label: string
  url: string | null | undefined
  className?: string
}) {
  const src = localAssetUrl(url) ?? marketLogoSrc(symbol)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasImage = src !== failedSrc
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-serif",
        hasImage ? "bg-transparent" : "bg-panel-3",
        className,
      )}
    >
      {hasImage ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="font-medium text-ink">{label.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}
