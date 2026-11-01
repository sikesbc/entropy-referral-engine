"use client"

import { useEffect, useState } from "react"
import { firstRunDelay } from "./first-run-delay"
import { LeaderboardPreview } from "./leaderboard-preview"
import { ONBOARDING_CONNECTED_ADVANCE_MS, ONBOARDING_COPY } from "./onboarding-copy"
import { OnboardingRaisedButton, RAISED_BUTTON_CLASS } from "./onboarding-raised-button"
import { OnboardingTextButton } from "./onboarding-text-button"
import { XLogo } from "./x-logo"

export function LeaderboardStep({ onNext }: { onNext: () => void }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!connected) return
    const timer = window.setTimeout(onNext, ONBOARDING_CONNECTED_ADVANCE_MS)
    return () => window.clearTimeout(timer)
  }, [connected, onNext])

  return (
    <>
      <LeaderboardPreview />
      <div className="first-run-item flex w-full flex-col items-center gap-3" style={firstRunDelay(180)}>
        <OnboardingRaisedButton
          type="button"
          onClick={() => setConnected(true)}
          disabled={connected}
          aria-label={ONBOARDING_COPY.connectLabel}
          className={`${RAISED_BUTTON_CLASS} gap-2`}
        >
          {connected ? ONBOARDING_COPY.connected : ONBOARDING_COPY.connect}
          <XLogo className="h-4 w-4" />
        </OnboardingRaisedButton>
        <OnboardingTextButton onClick={onNext}>{ONBOARDING_COPY.skip}</OnboardingTextButton>
      </div>
    </>
  )
}
