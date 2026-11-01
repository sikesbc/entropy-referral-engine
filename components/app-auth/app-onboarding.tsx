"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { OnboardingFlow } from "@/components/onboarding/first-run-onboarding"
import { fetchUsernameAvailability } from "@/lib/referral-site/api"
import { APP_ME_QUERY_KEY, useAppIdentity } from "./app-identity"
import { AppReferralStep } from "./app-referral-step"

function useSiteUsernameAvailability(username: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: ["app", "site-username", username.toLowerCase()],
    queryFn: () => fetchUsernameAvailability(username),
    enabled,
    staleTime: 30_000,
    retry: false,
  })
}

function AppFirstRunOnboarding({ onFinished }: { onFinished: () => void }) {
  const queryClient = useQueryClient()
  const complete = async () => {
    await queryClient.invalidateQueries({ queryKey: APP_ME_QUERY_KEY })
    onFinished()
  }
  return (
    <OnboardingFlow
      initialUsername=""
      currentUsername={null}
      complete={complete}
      useAvailability={useSiteUsernameAvailability}
      Referral={AppReferralStep}
    />
  )
}

export function AppOnboardingGate({ children }: { children: ReactNode }) {
  const { privyUserId, registration } = useAppIdentity()
  const [onboarding, setOnboarding] = useState<string | null>(null)

  if (registration === "unregistered" && privyUserId && onboarding !== privyUserId) setOnboarding(privyUserId)

  if (privyUserId && onboarding === privyUserId) {
    return <AppFirstRunOnboarding key={privyUserId} onFinished={() => setOnboarding(null)} />
  }
  return children
}
