"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState, type ComponentType } from "react"
import { useDepositModal } from "@/components/deposit/deposit-modal-context"
import { useCompleteOnboarding } from "@/lib/api/account"
import { ApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth"
import type { SessionUser } from "@/lib/auth/types"
import { CandleField } from "./candle-field"
import { firstRunDelay } from "./first-run-delay"
import { LeaderboardStep } from "./leaderboard-step"
import { OnboardingBackButton } from "./onboarding-back-button"
import {
  ONBOARDING_COPY,
  ONBOARDING_LEAVE_MS,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "./onboarding-copy"
import { OnboardingProgress } from "./onboarding-progress"
import { OnboardingTitle } from "./onboarding-title"
import { clearPendingReferral, storeReferralDraft } from "./pending-referral"
import { ReferralStep, type ReferralStepProps } from "./referral-step"
import type { UsernameAvailabilityQuery } from "./use-username-status"
import { UsernameStep } from "./username-step"
import { suggestedUsername } from "./username-rules"
import { WelcomeStep } from "./welcome-step"

type FinishIntent = "deposit" | null

const PREVIOUS_STEP: Record<OnboardingStep, OnboardingStep> = {
  username: "username",
  referral: "username",
  leaderboard: "referral",
  welcome: "leaderboard",
}

function completionError(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null) {
    const message = (error.body as { error?: unknown }).error
    if (typeof message === "string" && message) return message
  }
  return ONBOARDING_COPY.completeError
}

export type OnboardingResult = { username: string; referralCode: string | null }

export type OnboardingFlowProps = {
  initialUsername: string
  currentUsername: string | null
  complete: (result: OnboardingResult) => Promise<void>
  useAvailability?: UsernameAvailabilityQuery
  Referral?: ComponentType<ReferralStepProps>
}

export function FirstRunOnboarding({ user }: { user: SessionUser }) {
  const { refreshSession } = useAuth()
  const completeOnboarding = useCompleteOnboarding()
  const complete = async ({ username, referralCode }: OnboardingResult) => {
    try {
      await completeOnboarding.mutateAsync({ username: username || user.username, referralCode })
      await refreshSession()
    } catch (error) {
      throw new Error(completionError(error))
    }
  }
  return (
    <OnboardingFlow
      initialUsername={suggestedUsername(user.username)}
      currentUsername={suggestedUsername(user.username) || null}
      complete={complete}
    />
  )
}

export function OnboardingFlow({
  initialUsername,
  currentUsername,
  complete,
  useAvailability,
  Referral = ReferralStep,
}: OnboardingFlowProps) {
  const router = useRouter()
  const { openDeposit } = useDepositModal()
  const [step, setStep] = useState<OnboardingStep>("username")
  const [username, setUsername] = useState(initialUsername)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const displayName = username.trim() || currentUsername
  const stepIndex = ONBOARDING_STEPS.indexOf(step)
  const subtitle =
    step === "referral"
      ? ONBOARDING_COPY.referralSubtitle
      : step === "welcome" && displayName
        ? ONBOARDING_COPY.greeting(displayName)
        : null

  const goTo = useCallback((next: OnboardingStep) => {
    setError(null)
    setStep(next)
  }, [])
  const toWelcome = useCallback(() => goTo("welcome"), [goTo])

  const finish = (intent: FinishIntent) => {
    if (leaving) return
    setLeaving(true)
    setError(null)
    window.setTimeout(() => {
      complete({ username: username.trim(), referralCode })
        .then(() => {
          clearPendingReferral()
          storeReferralDraft("")
          router.replace("/trade")
          if (intent === "deposit") openDeposit()
        })
        .catch((reason: unknown) => {
          setLeaving(false)
          setError(reason instanceof Error && reason.message ? reason.message : ONBOARDING_COPY.completeError)
        })
    }, ONBOARDING_LEAVE_MS)
  }

  return (
    <div
      className="entropy-trade-scope first-run-onboarding fixed inset-0 z-[130] flex overflow-hidden bg-panel text-ink"
      data-leaving={leaving || undefined}
      role="dialog"
      aria-modal="true"
      aria-label={ONBOARDING_COPY.title}
    >
      <div
        aria-hidden="true"
        className="relative hidden w-1/2 shrink-0 overflow-hidden border-r border-line md:block"
      >
        <CandleField />
      </div>
      <div className="relative flex w-full flex-col justify-center overflow-y-auto px-8 py-14 sm:px-14 md:w-1/2">
        <OnboardingProgress current={stepIndex} total={ONBOARDING_STEPS.length} />
        {step !== "username" && !locked ? (
          <OnboardingBackButton onClick={() => leaving || goTo(PREVIOUS_STEP[step])} />
        ) : null}
        <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-start gap-8">
          {step === "username" || subtitle ? (
            <div className="flex flex-col items-start gap-3 text-left">
              {step === "username" ? <OnboardingTitle text={ONBOARDING_COPY.title} /> : null}
              {subtitle ? (
                <p className="first-run-item text-[14px] text-ink-soft" style={firstRunDelay(480)}>
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : null}
          <div key={step} className="flex w-full flex-col gap-8">
            {step === "username" ? (
              <UsernameStep
                value={username}
                currentUsername={currentUsername}
                useAvailability={useAvailability}
                onChange={setUsername}
                onContinue={() => goTo("referral")}
              />
            ) : null}
            {step === "referral" ? (
              <Referral
                username={username.trim()}
                onLock={() => setLocked(true)}
                onApplied={(code) => {
                  setReferralCode(code)
                  goTo("leaderboard")
                }}
                onSkip={() => goTo("leaderboard")}
              />
            ) : null}
            {step === "leaderboard" ? <LeaderboardStep onNext={toWelcome} /> : null}
            {step === "welcome" ? (
              <WelcomeStep
                referralCode={referralCode}
                error={error}
                busy={leaving}
                onDeposit={() => finish("deposit")}
                onDone={() => finish(null)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
