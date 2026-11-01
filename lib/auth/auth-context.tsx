"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { useTheme } from "@/lib/theme/theme-context"
import { MockAuthProvider } from "./mock-auth-provider"
import type { AuthProvider, EmailChallenge, Session, WalletId } from "./types"

type AuthContextValue = {
  session: Session
  provider: AuthProvider
  setSession: (session: Session) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthSessionProvider({
  initialSession,
  provider,
  children,
}: {
  initialSession: Session
  provider?: AuthProvider
  children: ReactNode
}) {
  const [session, setSessionState] = useState(initialSession)
  const [fallbackProvider] = useState<AuthProvider>(() => new MockAuthProvider())
  const authProvider = provider ?? fallbackProvider
  const queryClient = useQueryClient()
  const router = useRouter()
  const { setTheme } = useTheme()

  const setSession = useCallback(
    (next: Session) => {
      setSessionState(next)
      setTheme(next.status === "loggedin" ? next.user.theme : "dark")
      queryClient.clear()
      router.refresh()
    },
    [queryClient, router, setTheme],
  )

  const value = useMemo(
    () => ({ session, provider: authProvider, setSession }),
    [session, authProvider, setSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useSession must be used inside AuthSessionProvider")
  return context
}

export function useSession() {
  const { session } = useAuthContext()
  return {
    session,
    status: session.status,
    user: session.user,
    isSignedIn: session.status === "loggedin",
  }
}

export function useAuth() {
  const { provider, setSession } = useAuthContext()
  return useMemo(
    () => ({
      signInWithEmail: (email: string): Promise<EmailChallenge> => provider.signInWithEmail(email),
      verifyCode: async (email: string, code: string) => {
        const next = await provider.verifyCode(email, code)
        setSession(next)
        return next
      },
      signInWithWallet: async (wallet: WalletId) => {
        const next = await provider.signInWithWallet(wallet)
        setSession(next)
        return next
      },
      signOut: async () => {
        const next = await provider.signOut()
        setSession(next)
        return next
      },
      refreshSession: async () => {
        const next = await provider.getSession()
        setSession(next)
        return next
      },
    }),
    [provider, setSession],
  )
}
