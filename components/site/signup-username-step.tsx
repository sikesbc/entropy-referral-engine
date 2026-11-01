"use client"

import { UsernameStep } from "@/components/onboarding/username-step"
import { useSiteUsernameAvailability } from "@/lib/referral-site/use-username-availability"
import {
  SIGNUP_INPUT_CLASS,
  SIGNUP_LABEL_CLASS,
  SIGNUP_PRIMARY_CLASS,
  SignupHeading,
  SignupLead,
} from "./signup-text"

export function SignupUsernameStep({
  value,
  busy,
  error,
  continueLabel,
  onChange,
  onContinue,
}: {
  value: string
  busy: boolean
  error: string | null
  continueLabel?: string
  onChange: (value: string) => void
  onContinue: () => void
}) {
  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <SignupHeading>Pick a username</SignupHeading>
        <SignupLead>Your username becomes your link. You can’t change it later.</SignupLead>
      </div>
      <UsernameStep
        value={value}
        currentUsername={null}
        busy={busy}
        error={error}
        continueLabel={continueLabel}
        label="Username"
        labelClassName={SIGNUP_LABEL_CLASS}
        inputClassName={SIGNUP_INPUT_CLASS}
        buttonClassName={SIGNUP_PRIMARY_CLASS}
        useAvailability={useSiteUsernameAvailability}
        onChange={onChange}
        onContinue={onContinue}
      />
    </>
  )
}
