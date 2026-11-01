"use client"

import { CircleAlert } from "lucide-react"
import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { firstRunDelay } from "./first-run-delay"
import { ONBOARDING_COPY } from "./onboarding-copy"
import { OnboardingRaisedButton } from "./onboarding-raised-button"
import { useUsernameStatus, type UsernameAvailabilityQuery } from "./use-username-status"
import { usernameError } from "./username-rules"

const INPUT_CLASS =
  "w-full rounded-[8px] bg-panel-2 px-3.5 py-3 text-[14px] placeholder:text-ink-ghost ring-1 ring-inset ring-line transition-shadow focus:outline-none focus:ring-[color:#7c7c7c] focus:placeholder:text-transparent text-ink"

const STATUS_MESSAGES: Partial<Record<string, string>> = {
  checking: ONBOARDING_COPY.usernameChecking,
  available: ONBOARDING_COPY.usernameAvailable,
}

export function UsernameStep({
  value,
  currentUsername,
  onChange,
  onContinue,
  useAvailability,
  busy = false,
  error = null,
  continueLabel = ONBOARDING_COPY.continue,
  label = ONBOARDING_COPY.usernameTitle,
  labelClassName = "text-[12px] font-medium text-ink-quiet",
  inputClassName = INPUT_CLASS,
  buttonClassName,
}: {
  value: string
  currentUsername: string | null
  onChange: (value: string) => void
  onContinue: () => void
  useAvailability?: UsernameAvailabilityQuery
  busy?: boolean
  error?: string | null
  continueLabel?: string
  label?: string
  labelClassName?: string
  inputClassName?: string
  buttonClassName?: string
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const username = value.trim()
  const status = useUsernameStatus(username, currentUsername, useAvailability)
  const validationError = usernameError(username, false)
  const takenError = status === "unavailable" ? ONBOARDING_COPY.usernameTaken : null
  const alert = validationError ?? takenError ?? submitError ?? error
  const statusMessage = STATUS_MESSAGES[status]
  const blocked =
    busy || !!validationError || status === "idle" || status === "checking" || status === "unavailable"

  useEffect(() => inputRef.current?.focus(), [])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const problem = usernameError(username, true)
    if (problem) {
      setSubmitError(problem)
      return
    }
    if (status !== "available" && status !== "error") return
    onContinue()
  }

  return (
    <form className="flex w-full flex-col" onSubmit={submit}>
      <section className="first-run-item flex w-full flex-col gap-2.5" style={firstRunDelay(40)}>
        <label htmlFor={`${id}-input`} className={labelClassName}>
          {label}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id={`${id}-input`}
            aria-describedby={`${id}-help ${id}-message`}
            autoComplete="off"
            spellCheck={false}
            maxLength={31}
            value={value}
            onChange={(event) => {
              onChange(event.target.value)
              setSubmitError(null)
            }}
            aria-invalid={!!alert || undefined}
            placeholder={ONBOARDING_COPY.usernamePlaceholder}
            className={inputClassName}
          />
        </div>
        <p id={`${id}-help`} className="text-[12px] leading-relaxed text-ink-quiet">
          {ONBOARDING_COPY.usernameHelp}
        </p>
      </section>
      {alert ? (
        <div id={`${id}-message`} className="overflow-hidden" role="alert">
          <p className="flex items-center gap-1.5 pt-3 text-[12px] text-down">
            <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{alert}</span>
          </p>
        </div>
      ) : statusMessage ? (
        <p
          id={`${id}-message`}
          className={`pt-3 text-[12px] ${status === "available" ? "text-up" : "text-ink-quiet"}`}
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
      <div
        className={buttonClassName ? "first-run-item mt-6 w-full" : "first-run-item mt-3 w-full"}
        style={firstRunDelay(120)}
      >
        {buttonClassName ? (
          <button type="submit" aria-busy={busy || undefined} disabled={blocked} className={buttonClassName}>
            {continueLabel}
          </button>
        ) : (
          <OnboardingRaisedButton type="submit" aria-busy={busy || undefined} disabled={blocked}>
            {continueLabel}
          </OnboardingRaisedButton>
        )}
      </div>
    </form>
  )
}
