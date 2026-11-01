"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { DepositModal } from "./deposit-modal"

type DepositModalContextValue = {
  openDeposit: () => void
}

const DepositModalContext = createContext<DepositModalContextValue | null>(null)

export function DepositModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openDeposit = useCallback(() => setOpen(true), [])
  const value = useMemo(() => ({ openDeposit }), [openDeposit])
  return (
    <DepositModalContext.Provider value={value}>
      {children}
      <DepositModal open={open} onOpenChange={setOpen} />
    </DepositModalContext.Provider>
  )
}

export function useDepositModal(): DepositModalContextValue {
  const context = useContext(DepositModalContext)
  if (!context) throw new Error("useDepositModal must be used inside DepositModalProvider")
  return context
}
