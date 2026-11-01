"use client"

import { Check, CircleAlert, LoaderCircle } from "lucide-react"
import { useEffect, useRef, type FormEvent } from "react"
import { firstRunDelay } from "@/components/onboarding/first-run-delay"
import { normalizeCode } from "@/lib/referral-site/code"
import type { CodeStatus } from "./signup-logic"
import {
  SIGNUP_INPUT_CLASS,
  SIGNUP_LABEL_CLASS,
  SIGNUP_PRIMARY_CLASS,
  SIGNUP_QUIET_CLASS,
  SignupActions,
  SignupError,
  SignupHeading,
  SignupLead,
} from "./signup-text"

function CodeMessage({ check }: { check: CodeStatus }) {
  if (check.status === "empty") return null
  if (check.status === "checking")
    return (
      <span className="flex items-center gap-1.5 text-ink-quiet">
        <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
        Checking code…
      </span>
    )
  if (check.status === "valid")
    return (
      <span className="flex items-center gap-1.5 text-up">
        <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
        {`Valid: invited by ${check.username}`}
      </span>
    )
  const text =
    check.status === "own"
      ? "That’s your own code. Enter a friend’s code or skip."
      : check.status === "error"
        ? "We couldn’t check this code. Try again."
        : "No one has this code. Check the spelling or skip."
  return (
    <span className="flex items-center gap-1.5 text-down">
      <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
      {text}
    </span>
  )
}

export function SignupCodeStep({
  code,
  check,
  submitting,
  error,
  onChange,
  onSubmit,
}: {
  code: string
  check: CodeStatus
  submitting: boolean
  error: string | null
  onChange: (code: string) => void
  onSubmit: (code: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const normalized = normalizeCode(code)
  const valid = check.status === "valid"
  const invalid = check.status === "unknown" || check.status === "own"

  useEffect(() => inputRef.current?.focus(), [])

  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submitting && normalized && valid) onSubmit(normalized)
  }

  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <SignupHeading>Invited by a friend?</SignupHeading>
        <SignupLead>Enter their code so they get credit for inviting you. You can skip this.</SignupLead>
      </div>
      <form className="flex w-full flex-col gap-6" onSubmit={apply}>
        <div className="first-run-item flex w-full flex-col gap-2.5" style={firstRunDelay(80)}>
          <label htmlFor="invite-code" className={SIGNUP_LABEL_CLASS}>
            Invite code
          </label>
          <input
            ref={inputRef}
            id="invite-code"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={64}
            value={code}
            readOnly={submitting}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Their username"
            aria-invalid={invalid || !!error || undefined}
            aria-describedby="invite-code-status"
            className={SIGNUP_INPUT_CLASS}
          />
          <p
            id="invite-code-status"
            aria-live="polite"
            className="min-h-[1.45em] text-[0.8125rem] leading-[1.45]"
          >
            <CodeMessage check={check} />
          </p>
          <SignupError message={error} />
        </div>
        <SignupActions>
          <button
            type="submit"
            aria-busy={submitting || undefined}
            disabled={submitting || !valid}
            className={SIGNUP_PRIMARY_CLASS}
          >
            {submitting ? "Creating your link…" : "Create my link"}
          </button>
          <button type="button" onClick={() => submitting || onSubmit(null)} className={SIGNUP_QUIET_CLASS}>
            Skip, I don’t have one
          </button>
        </SignupActions>
      </form>
    </>
  )
}
