"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { applyTheme, persistTheme } from "./apply-theme"
import type { Theme } from "./types"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme, options?: { persist?: boolean }) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ initialTheme, children }: { initialTheme: Theme; children: ReactNode }) {
  const [theme, setThemeState] = useState(initialTheme)

  const setTheme = useCallback((next: Theme, options?: { persist?: boolean }) => {
    setThemeState(next)
    applyTheme(next)
    if (options?.persist) persistTheme(next)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used inside ThemeProvider")
  return context
}
