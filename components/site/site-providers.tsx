"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import type { ReactNode } from "react"
import { useSiteQueryPersistence } from "@/lib/referral-site/queries"
import { SiteWalletProvider } from "@/lib/referral-site/wallet"

const PRIVY_CONFIG = {
  appearance: {
    theme: "dark",
    walletChainType: "ethereum-only",
    showWalletLoginFirst: true,
    logo: "/entropy-logo-white.svg",
    landingHeader: "Connect your Hyperliquid wallet",
  },
  loginMethods: ["wallet"],
  embeddedWallets: { ethereum: { createOnLogin: "off" } },
} as const

function SiteQueryPersistence({ children }: { children: ReactNode }) {
  useSiteQueryPersistence()
  return children
}

export function SiteProviders({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  if (!appId) throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set")
  return (
    <PrivyProvider appId={appId} config={{ ...PRIVY_CONFIG, loginMethods: [...PRIVY_CONFIG.loginMethods] }}>
      <SiteWalletProvider>
        <SiteQueryPersistence>{children}</SiteQueryPersistence>
      </SiteWalletProvider>
    </PrivyProvider>
  )
}
