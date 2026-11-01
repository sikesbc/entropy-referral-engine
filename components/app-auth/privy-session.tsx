"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useEffect, type ReactNode } from "react"
import { AuthSessionProvider, useAuth, useSession } from "@/lib/auth/auth-context"
import { usePrivyAuthProvider, type PrivyAuthProvider } from "./use-privy-auth-provider"

function PrivySessionSync({ provider }: { provider: PrivyAuthProvider }) {
  const { ready, authenticated } = usePrivy()
  const { isSignedIn } = useSession()
  const { refreshSession } = useAuth()

  useEffect(() => {
    if (!ready || provider.isBusy() || authenticated === isSignedIn) return
    refreshSession().catch(() => undefined)
  }, [ready, authenticated, isSignedIn, provider, refreshSession])

  return null
}

export function PrivySessionProvider({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const provider = usePrivyAuthProvider()
  return (
    <AuthSessionProvider initialSession={session} provider={provider}>
      <PrivySessionSync provider={provider} />
      {children}
    </AuthSessionProvider>
  )
}
