"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { marketTitle, type MarketRow } from "@/lib/markets/market-rows"
import { useMarketDescription } from "@/lib/markets/use-market-description"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { cn } from "@/lib/utils"
import { FeaturedMarket } from "./featured-market"

export type FeaturedSlide = { row: MarketRow; kind: string }

const ROTATE_MS = 7_000

function slideLabel(slides: FeaturedSlide[], index: number): string {
  if (slides[index].kind === "featured") return "Featured"
  return index === slides.findIndex((slide) => slide.kind === "mover")
    ? "Biggest mover today"
    : "Moving today"
}

export function FeaturedMarkets({ slides, isLoading }: { slides: FeaturedSlide[]; isLoading: boolean }) {
  const [selected, setSelected] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)
  const rotateInterval = usePollingInterval(ROTATE_MS)
  const count = slides.length
  const index = count ? selected % count : 0
  const slide = slides[index]
  const { description, pending } = useMarketDescription(slide?.row.market.name ?? null)

  useEffect(() => {
    if (count < 2 || isPaused || rotateInterval === false) return
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return
      setIsAnimated(true)
      setSelected((current) => (current + 1) % count)
    }, rotateInterval)
    return () => window.clearInterval(id)
  }, [count, isPaused, rotateInterval, index])

  if (!slide || pending) {
    return isLoading || slide ? <Skeleton className="block h-[25.8rem] rounded-[0.625rem] bg-ink/10" /> : null
  }

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Featured markets"
      className="relative grid"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <FeaturedMarket
        key={slide.row.market.name}
        row={slide.row}
        label={slideLabel(slides, index)}
        description={description}
        isFeatured={slide.kind === "featured"}
        isAnimated={isAnimated}
      />
      {count > 1 ? (
        <div
          role="tablist"
          aria-label="Choose a market"
          className="absolute right-5 top-5 flex items-center gap-1.5"
        >
          {slides.map((item, itemIndex) => (
            <button
              key={item.row.market.name}
              type="button"
              role="tab"
              aria-selected={itemIndex === index}
              aria-label={marketTitle(item.row.market)}
              onClick={() => {
                setIsAnimated(true)
                setSelected(itemIndex)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                itemIndex === index ? "w-5 bg-ink" : "w-1.5 bg-ink/25 hover:bg-ink/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
