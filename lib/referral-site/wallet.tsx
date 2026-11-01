"use client"

import { useLogin, usePrivy } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
import { usePathname, useSearchParams } from "next/navigation"
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import { startsSignedIn } from "./demo"
import { DEMO_ADDRESS } from "./mock-data"
import { WalletError, walletErrorKind } from "./wallet-errors"

const DEMO_CONNECT_MS = 700

type PendingConnect = { resolve: (address: string) => void; reject: (error: Error) => void }

export type AuthHeaders = Record<string, string>

export type SiteWallet = {
  ready: boolean
  demo: boolean
  address: string | null
  connect: () => Promise<string>
  disconnect: () => Promise<void>
  authHeaders: (address?: string) => Promise<AuthHeaders>
}

const WalletContext = createContext<SiteWallet | null>(null)

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function walletAddress(user: { wallet?: { address: string } | null } | null): string | null {
  return user?.wallet?.address.toLowerCase() ?? null
}

export function SiteWalletProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const demoParam = searchParams.get("demo")
  const demo = demoParam !== null
  const privy = usePrivy()
  const queryClient = useQueryClient()
  const pending = useRef<PendingConnect | null>(null)
  const [demoAddress, setDemoAddress] = useState<string | null>(() =>
    startsSignedIn(pathname, demoParam) ? DEMO_ADDRESS : null,
  )

  const { login } = useLogin({
    onComplete: ({ user }) => {
      const address = walletAddress(user)
      if (address) pending.current?.resolve(address)
      else pending.current?.reject(new WalletError("no_wallet"))
      pending.current = null
    },
    onError: (error) => {
      pending.current?.reject(new WalletError(walletErrorKind(error)))
      pending.current = null
    },
  })

  const privyAddress = privy.authenticated ? walletAddress(privy.user) : null
  const address = demo ? demoAddress : privyAddress
  const { authenticated, getAccessToken, logout } = privy

  const connect = useCallback(async () => {
    if (demo) {
      await wait(DEMO_CONNECT_MS)
      setDemoAddress(DEMO_ADDRESS)
      return DEMO_ADDRESS
    }
    if (privyAddress) return privyAddress
    return new Promise<string>((resolve, reject) => {
      if (authenticated) {
        reject(new WalletError("no_wallet"))
        return
      }
      pending.current = { resolve, reject }
      try {
        login()
      } catch (error) {
        pending.current = null
        reject(new WalletError(walletErrorKind(error)))
      }
    })
  }, [demo, privyAddress, authenticated, login])

  const disconnect = useCallback(async () => {
    if (demo) {
      setDemoAddress(null)
      return
    }
    await logout()
    queryClient.clear()
  }, [demo, logout, queryClient])

  const authHeaders = useCallback(
    async (requested?: string) => {
      const token = await getAccessToken()
      if (!token) throw new WalletError("session_ended")
      const headers: AuthHeaders = { authorization: `Bearer ${token}` }
      const wallet = requested ?? privyAddress
      if (wallet) headers["x-wallet-address"] = wallet
      return headers
    },
    [getAccessToken, privyAddress],
  )

  const value = useMemo(
    () => ({ ready: demo || privy.ready, demo, address, connect, disconnect, authHeaders }),
    [demo, privy.ready, address, connect, disconnect, authHeaders],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useSiteWallet(): SiteWallet {
  const wallet = useContext(WalletContext)
  if (!wallet) throw new Error("useSiteWallet must be used inside SiteWalletProvider")
  return wallet
}
