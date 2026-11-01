import { firstRunDelay } from "./first-run-delay"
import { ONBOARDING_COPY } from "./onboarding-copy"
import { OnboardingRaisedButton } from "./onboarding-raised-button"
import { OnboardingTextButton } from "./onboarding-text-button"

export function WelcomeStep({
  referralCode,
  error,
  busy,
  onDeposit,
  onDone,
}: {
  referralCode: string | null
  error: string | null
  busy: boolean
  onDeposit: () => void
  onDone: () => void
}) {
  return (
    <>
      {error ? (
        <p className="text-[12px] text-down" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-3" />
      {referralCode ? (
        <p
          className="first-run-item flex items-center gap-1.5 text-[12px] text-ink-quiet"
          style={firstRunDelay(140)}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-up"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {ONBOARDING_COPY.referredBy(referralCode)}
        </p>
      ) : null}
      <div className="first-run-item flex w-full flex-col items-center gap-3" style={firstRunDelay(180)}>
        <OnboardingRaisedButton type="button" disabled={busy} onClick={onDeposit}>
          {ONBOARDING_COPY.deposit}
        </OnboardingRaisedButton>
        <OnboardingTextButton onClick={onDone}>{ONBOARDING_COPY.done}</OnboardingTextButton>
      </div>
    </>
  )
}
