"use client"

import { useEffect, type ReactNode } from "react"
import { AppOnboardingGate } from "@/components/app-auth/app-onboarding"
import { APP_MODE } from "@/lib/app-mode"
import { useSession } from "@/lib/auth"
import { FirstRunOnboarding } from "./first-run-onboarding"
import { referralCodeFromSearch, storePendingReferral } from "./pending-referral"

function MockOnboardingGate({ children }: { children: ReactNode }) {
  const { user } = useSession()
  if (user && !user.onboardingCompleted) return <FirstRunOnboarding key={user.id} user={user} />
  return children
}

export function OnboardingGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    const code = referralCodeFromSearch(window.location.search)
    if (code) storePendingReferral(code)
  }, [])

  return APP_MODE ? (
    <AppOnboardingGate>{children}</AppOnboardingGate>
  ) : (
    <MockOnboardingGate>{children}</MockOnboardingGate>
  )
}
