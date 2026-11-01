"use client"

import { useMemo } from "react"
import { useMobileListings } from "@/lib/api/markets"

export function useMarketDescription(symbol: string | null) {
  const listings = useMobileListings()
  const descriptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of listings.data?.items ?? []) {
      const text = item.description?.trim()
      if (text) map.set(item.symbol, text)
    }
    return map
  }, [listings.data])
  return {
    description: symbol ? (descriptions.get(symbol) ?? null) : null,
    pending: listings.isPending,
  }
}
