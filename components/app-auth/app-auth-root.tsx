"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import type { ReactNode } from "react"
import { LoginModalHost } from "@/components/auth/login-modal-host"
import { AppIdentityProvider } from "./app-identity"
import { InviteLoginPrompt } from "./invite-login-prompt"
import { APP_PRIVY_CONFIG } from "./privy-config"
import { PrivySessionProvider } from "./privy-session"

export function AppAuthRoot({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  if (!appId) throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set")
  return (
    <PrivyProvider appId={appId} config={APP_PRIVY_CONFIG}>
      <AppIdentityProvider>
        <PrivySessionProvider>
          {children}
          <LoginModalHost />
          <InviteLoginPrompt />
        </PrivySessionProvider>
      </AppIdentityProvider>
    </PrivyProvider>
  )
}
