"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { RuntimeConfig } from "./config"

const RuntimeConfigContext = createContext<RuntimeConfig>({ deterministic: false, frozenNow: null })

export function RuntimeConfigProvider({ value, children }: { value: RuntimeConfig; children: ReactNode }) {
  return <RuntimeConfigContext.Provider value={value}>{children}</RuntimeConfigContext.Provider>
}

export function useRuntimeConfig(): RuntimeConfig {
  return useContext(RuntimeConfigContext)
}

export function usePollingInterval(ms: number): number | false {
  return useRuntimeConfig().deterministic ? false : ms
}

export function useNow(tickMs = 1000): number {
  const { frozenNow } = useRuntimeConfig()
  const [now, setNow] = useState(() => frozenNow ?? Date.now())
  useEffect(() => {
    if (frozenNow !== null) return
    const id = window.setInterval(() => setNow(Date.now()), tickMs)
    return () => window.clearInterval(id)
  }, [frozenNow, tickMs])
  return frozenNow ?? now
}
