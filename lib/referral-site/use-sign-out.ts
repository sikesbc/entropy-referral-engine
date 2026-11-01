"use client"

import { useCallback } from "react"
import { forgetIgnoredInvite } from "./ignored-invite"
import { useSiteWallet } from "./wallet"

export function useSignOut(): () => Promise<void> {
  const { disconnect } = useSiteWallet()
  return useCallback(async () => {
    forgetIgnoredInvite()
    await disconnect()
  }, [disconnect])
}
