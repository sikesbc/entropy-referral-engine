"use client"

import type { ReactNode } from "react"
import { useSiteWallet } from "@/lib/referral-site/wallet"

export function SignedInOnly({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const { ready, address } = useSiteWallet()
  if (!ready) return <main aria-busy="true" className="flex-1" />
  return address ? children : fallback
}
