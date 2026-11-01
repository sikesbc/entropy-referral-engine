"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "entropy:favorite-markets"
const CHANGE_EVENT = "entropy:favorite-markets"

function readFavorites(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    return new Set(
      Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [],
    )
  } catch {
    return new Set()
  }
}

export function useFavoriteMarkets() {
  const [favorites, setFavorites] = useState<Set<string>>(readFavorites)

  useEffect(() => {
    const sync = () => setFavorites(readFavorites())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const toggle = useCallback((name: string) => {
    const next = readFavorites()
    if (!next.delete(name)) next.add(name)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
    } catch {}
    setFavorites(next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return { favorites, toggle }
}
