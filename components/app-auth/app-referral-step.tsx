"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { firstRunDelay } from "@/components/onboarding/first-run-delay"
import { ONBOARDING_COPY, USERNAME_CHECK_DELAY_MS } from "@/components/onboarding/onboarding-copy"
import { OnboardingRaisedButton } from "@/components/onboarding/onboarding-raised-button"
import { OnboardingTextButton } from "@/components/onboarding/onboarding-text-button"
import { readReferralDraft, storeReferralDraft } from "@/components/onboarding/pending-referral"
import {
  ONBOARDING_INPUT_CLASS,
  ONBOARDING_LABEL_CLASS,
  type ReferralStepProps,
} from "@/components/onboarding/referral-step"
import { useDebouncedValue } from "@/components/onboarding/use-debounced-value"
import { ApiError, fetchCode, postSignup } from "@/lib/referral-site/api"
import { normalizeCode } from "@/lib/referral-site/code"
import type { SignupResponse } from "@/lib/referral-site/types"
import { useAppIdentity } from "./app-identity"

type Outcome = { message: string; referrer: string | null }

function outcomeOf(result: SignupResponse): Outcome {
  if (result.status === "already_registered") {
    return { message: ONBOARDING_COPY.referralAlreadyRegistered(result.ignoredCode), referrer: null }
  }
  const { attribution } = result
  if (attribution.status === "attributed") return { message: "", referrer: attribution.referrer.username }
  if (attribution.status === "no_code") return { message: "", referrer: null }
  if (attribution.reason === "existing_trader") {
    return {
      message: ONBOARDING_COPY.referralExistingTrader(attribution.referrer?.username ?? null),
      referrer: null,
    }
  }
  if (attribution.reason === "self_referral") return { message: ONBOARDING_COPY.referralSelf, referrer: null }
  return { message: ONBOARDING_COPY.referralUnknownApplied(attribution.code), referrer: null }
}

function signupError(error: unknown): string {
  return error instanceof ApiError ? error.message : ONBOARDING_COPY.referralInvalid
}

function CheckIcon() {
  return (
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
  )
}

export function AppReferralStep({ username, onApplied, onSkip, onLock }: ReferralStepProps) {
  const { authHeaders } = useAppIdentity()
  const inputRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState(readReferralDraft)
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const normalized = normalizeCode(code)
  const debounced = useDebouncedValue(normalized, USERNAME_CHECK_DELAY_MS)
  const settled = debounced === normalized

  const lookup = useQuery({
    queryKey: ["app", "site-code", debounced],
    queryFn: () => fetchCode(debounced),
    enabled: debounced.length > 0,
    staleTime: 30_000,
    retry: false,
  })

  const signup = useMutation({
    mutationFn: async (referral: string | null) =>
      postSignup(await authHeaders(), { username, code: referral }),
  })

  useEffect(() => inputRef.current?.focus(), [])

  const lookupData = settled && normalized ? lookup.data : undefined
  const checking = normalized.length > 0 && (!settled || lookup.isPending)
  const referrer = lookupData?.status === "valid" ? lookupData.referrer : null
  const unknown = lookupData?.status === "unknown"
  const busy = signup.isPending
  const alert = error ?? (unknown ? ONBOARDING_COPY.referralUnknown : null)

  const register = (referral: string | null) => {
    if (busy || outcome) return
    setError(null)
    signup.mutate(referral, {
      onSuccess: (result) => {
        onLock()
        storeReferralDraft("")
        const next = outcomeOf(result)
        if (next.message) {
          setOutcome(next)
          return
        }
        if (next.referrer) onApplied(next.referrer)
        else onSkip()
      },
      onError: (reason) => setError(signupError(reason)),
    })
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (outcome) {
      onSkip()
      return
    }
    if (!normalized) {
      setError(ONBOARDING_COPY.referralInvalid)
      return
    }
    if (unknown || checking) return
    register(normalized)
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
          readOnly={busy || outcome !== null}
          onChange={(event) => {
            setCode(event.target.value)
            storeReferralDraft(event.target.value)
            setError(null)
          }}
          placeholder={ONBOARDING_COPY.referralPlaceholder}
          className={ONBOARDING_INPUT_CLASS}
          aria-invalid={!!alert || undefined}
        />
        {outcome ? (
          <p className="text-[12px] leading-relaxed text-ink-soft" role="status" aria-live="polite">
            {outcome.message}
          </p>
        ) : alert ? (
          <p className="text-[12px] text-down" role="alert">
            {alert}
          </p>
        ) : referrer ? (
          <p
            className="flex items-center gap-1.5 text-[12px] text-ink-quiet"
            role="status"
            aria-live="polite"
          >
            <CheckIcon />
            {ONBOARDING_COPY.referralInviting(referrer.username)}
          </p>
        ) : checking ? (
          <p className="text-[12px] text-ink-quiet" role="status" aria-live="polite">
            {ONBOARDING_COPY.referralChecking}
          </p>
        ) : null}
      </section>
      <div className="first-run-item flex w-full flex-col items-center gap-3" style={firstRunDelay(80)}>
        {outcome ? (
          <OnboardingRaisedButton type="submit">{ONBOARDING_COPY.continue}</OnboardingRaisedButton>
        ) : (
          <>
            <OnboardingRaisedButton type="submit" disabled={busy || !normalized || unknown || checking}>
              {busy ? ONBOARDING_COPY.saving : ONBOARDING_COPY.referralApply}
            </OnboardingRaisedButton>
            <OnboardingTextButton onClick={() => register(null)}>
              {ONBOARDING_COPY.referralSkip}
            </OnboardingTextButton>
          </>
        )}
      </div>
    </form>
  )
}
