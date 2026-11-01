"use client"

import {
  useConnectWallet,
  useLoginWithEmail,
  useLoginWithSiwe,
  usePrivy,
  type WalletListEntry,
} from "@privy-io/react-auth"
import { useMemo, useRef, useState } from "react"
import { MockAuthProvider } from "@/lib/auth/mock-auth-provider"
import type { AuthProvider, Session, WalletId } from "@/lib/auth/types"

type SiweWallet = {
  address: string
  chainId: string
  walletClientType: string
  connectorType: string
  sign: (message: string) => Promise<string>
}

type PendingConnect = { resolve: (wallet: SiweWallet) => void; reject: (error: Error) => void }

type Inflight = { authenticated: boolean; promise: Promise<Session> }

export type PrivyAuthProvider = AuthProvider & { isBusy: () => boolean }

export class WalletConnectFailed extends Error {}

const PRIVY_WALLETS: Partial<Record<WalletId, WalletListEntry>> = {
  metamask: "metamask",
  okx: "okx_wallet",
  coinbase: "coinbase_wallet",
  rainbow: "rainbow",
  phantom: "phantom",
  walletconnect: "wallet_connect",
}

function caip2(chainId: string): `eip155:${number}` {
  if (/^eip155:\d+$/.test(chainId)) return chainId as `eip155:${number}`
  const numeric = Number(chainId)
  return `eip155:${Number.isFinite(numeric) && numeric > 0 ? numeric : 1}`
}

export function usePrivyAuthProvider(): PrivyAuthProvider {
  const { authenticated, logout } = usePrivy()
  const { sendCode, loginWithCode } = useLoginWithEmail()
  const { generateSiweMessage, loginWithSiwe } = useLoginWithSiwe()
  const pendingConnect = useRef<PendingConnect | null>(null)
  const busy = useRef(0)
  const inflight = useRef<Inflight | null>(null)
  const [cookieSession] = useState(() => new MockAuthProvider())

  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      const pending = pendingConnect.current
      pendingConnect.current = null
      if (wallet.type === "ethereum") pending?.resolve(wallet)
      else pending?.reject(new WalletConnectFailed())
    },
    onError: () => {
      pendingConnect.current?.reject(new WalletConnectFailed())
      pendingConnect.current = null
    },
  })

  return useMemo(() => {
    const syncSession = (signedIn: boolean): Promise<Session> => {
      const current = inflight.current
      if (current && current.authenticated === signedIn) return current.promise
      const promise = (signedIn ? cookieSession.signInWithWallet("privy") : cookieSession.signOut()).finally(
        () => {
          if (inflight.current?.promise === promise) inflight.current = null
        },
      )
      inflight.current = { authenticated: signedIn, promise }
      return promise
    }

    const whileBusy = async <T>(run: () => Promise<T>): Promise<T> => {
      busy.current += 1
      try {
        return await run()
      } finally {
        busy.current -= 1
      }
    }

    const connect = (wallet: WalletId) =>
      new Promise<SiweWallet>((resolve, reject) => {
        pendingConnect.current?.reject(new WalletConnectFailed())
        pendingConnect.current = { resolve, reject }
        connectWallet({
          walletList: [PRIVY_WALLETS[wallet] ?? "detected_ethereum_wallets"],
          walletChainType: "ethereum-only",
        })
      })

    return {
      isBusy: () => busy.current > 0,
      getSession: () => syncSession(authenticated),
      signInWithEmail: async (email) => {
        await sendCode({ email })
        return { email }
      },
      verifyCode: (_email, code) =>
        whileBusy(async () => {
          await loginWithCode({ code })
          return syncSession(true)
        }),
      signInWithWallet: async (walletId) => {
        const wallet = await connect(walletId)
        const message = await generateSiweMessage({ address: wallet.address, chainId: caip2(wallet.chainId) })
        const signature = await wallet.sign(message)
        return whileBusy(async () => {
          await loginWithSiwe({
            signature,
            message,
            walletClientType: wallet.walletClientType,
            connectorType: wallet.connectorType,
          })
          return syncSession(true)
        })
      },
      signOut: () =>
        whileBusy(async () => {
          await logout()
          return syncSession(false)
        }),
    }
  }, [
    authenticated,
    logout,
    sendCode,
    loginWithCode,
    generateSiweMessage,
    loginWithSiwe,
    connectWallet,
    cookieSession,
  ])
}
