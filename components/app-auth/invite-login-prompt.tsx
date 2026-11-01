"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useEffect, useRef } from "react"
import { useLoginModal } from "@/components/auth/login-modal-context"
import { referralCodeFromSearch } from "@/components/onboarding/pending-referral"

export function InviteLoginPrompt() {
  const { ready, authenticated } = usePrivy()
  const { openLogin } = useLoginModal()
  const prompted = useRef(false)

  useEffect(() => {
    if (!ready || authenticated || prompted.current) return
    if (!referralCodeFromSearch(window.location.search)) return
    prompted.current = true
    openLogin()
  }, [ready, authenticated, openLogin])

  return null
}
