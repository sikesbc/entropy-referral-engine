"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useApplyReferralCode } from "@/lib/api/referrals"
import { firstRunDelay } from "./first-run-delay"
import { ONBOARDING_COPY } from "./onboarding-copy"
import { OnboardingRaisedButton } from "./onboarding-raised-button"
import { OnboardingTextButton } from "./onboarding-text-button"
import { readReferralDraft, storeReferralDraft } from "./pending-referral"

export const ONBOARDING_INPUT_CLASS =
  "w-full rounded-[8px] bg-panel-2 px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-ghost ring-1 ring-inset ring-line transition-shadow focus:outline-none focus:ring-[color:#7c7c7c]"

export const ONBOARDING_LABEL_CLASS = "text-[11px] font-medium uppercase tracking-[0.08em] text-ink-quiet"

export type ReferralStepProps = {
  username: string
  onApplied: (code: string) => void
  onSkip: () => void
  onLock: () => void
}

export function ReferralStep({ onApplied, onSkip }: ReferralStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState(readReferralDraft)
  const [error, setError] = useState<string | null>(null)
  const apply = useApplyReferralCode()
  const trimmed = code.trim()

  useEffect(() => inputRef.current?.focus(), [])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (apply.isPending) return
    if (!trimmed) {
      setError(ONBOARDING_COPY.referralInvalid)
      return
    }
    setError(null)
    apply.mutate(trimmed, {
      onSuccess: (result) => {
        if (result.status === "rejected") {
          setError(result.message || ONBOARDING_COPY.referralInvalid)
          return
        }
        storeReferralDraft("")
        onApplied(result.status === "attached" ? result.attribution.partner.slug : trimmed.toLowerCase())
      },
      onError: () => setError(ONBOARDING_COPY.referralInvalid),
    })
  }

  const skip = () => {
    if (apply.isPending) return
    setError(null)
    storeReferralDraft("")
    onSkip()
  }

  return (
    <form className="flex w-full flex-col gap-3" onSubmit={submit}>
      <section className="first-run-item flex w-full flex-col gap-2.5" style={firstRunDelay(0)}>
        <div className={ONBOARDING_LABEL_CLASS}>{ONBOARDING_COPY.referralTitle}</div>
        <input
          ref={inputRef}
          autoComplete="off"
          spellCheck={false}
          maxLength={64}
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            storeReferralDraft(event.target.value)
            setError(null)
          }}
          placeholder={ONBOARDING_COPY.referralPlaceholder}
          className={ONBOARDING_INPUT_CLASS}
          aria-invalid={!!error || undefined}
        />
        {error ? (
          <p className="text-[12px] text-down" role="alert">
            {error}
          </p>
        ) : null}
      </section>
      <div className="first-run-item flex w-full flex-col items-center gap-3" style={firstRunDelay(80)}>
        <OnboardingRaisedButton type="submit" disabled={apply.isPending || !trimmed}>
          {apply.isPending ? ONBOARDING_COPY.saving : ONBOARDING_COPY.referralApply}
        </OnboardingRaisedButton>
        <OnboardingTextButton onClick={skip}>{ONBOARDING_COPY.referralSkip}</OnboardingTextButton>
      </div>
    </form>
  )
}
