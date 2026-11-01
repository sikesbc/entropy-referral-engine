"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

export type LoginModalView = "email" | "code" | "wallets"

type LoginModalContextValue = {
  open: boolean
  view: LoginModalView
  openLogin: (view?: LoginModalView) => void
  closeLogin: () => void
  setView: (view: LoginModalView) => void
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null)

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<LoginModalView>("email")

  const openLogin = useCallback((next: LoginModalView = "email") => {
    setView(next)
    setOpen(true)
  }, [])
  const closeLogin = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({ open, view, openLogin, closeLogin, setView }),
    [open, view, openLogin, closeLogin],
  )
  return <LoginModalContext.Provider value={value}>{children}</LoginModalContext.Provider>
}

export function useLoginModal(): LoginModalContextValue {
  const context = useContext(LoginModalContext)
  if (!context) throw new Error("useLoginModal must be used inside LoginModalProvider")
  return context
}
