"use client"

import { Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { humane } from "@/components/onboarding/humane-font"
import { normalizeCode } from "@/lib/referral-site/code"
import { REFERRER_SHARE, referralUrl } from "@/lib/referral-site/config"
import type { SignupDemo } from "@/lib/referral-site/demo"
import { formatPercent } from "@/lib/referral-site/format"
import { rememberInviteNotice } from "@/lib/referral-site/ignored-invite"
import { inviteNoticeFor, inviteNoticeHref } from "@/lib/referral-site/invite-notice"
import type { CodeLookup } from "@/lib/referral-site/types"
import { useRegistration } from "@/lib/referral-site/use-registration"
import { useWalletSignup } from "@/lib/referral-site/use-wallet-signup"
import { useSiteWallet } from "@/lib/referral-site/wallet"
import { SignupCodeStep } from "./signup-code-step"
import { SignupConnectStep } from "./signup-connect-step"
import { SignupFrame, SignupPending } from "./signup-frame"
import { SignupInviteStep } from "./signup-invite-step"
import { useEligibility, useInviteCheck } from "./signup-logic"
import { PassStub, SignupPass } from "./signup-pass"
import { SignupResult, SignupResultPass } from "./signup-result"
import { SignupUsernameStep } from "./signup-username-step"

const OPEN_STEPS = ["connect", "username", "code", "done"] as const
const INVITE_STEPS = ["invite", "username", "done"] as const
const USERNAME_ERROR_CODES = new Set(["invalid_username", "reserved_username", "username_taken"])
const CHECK_FAILED_MESSAGE = "We couldn’t check whether this wallet has signed up. Try again."
const PLACEHOLDER_NAME = "your_name"

function PreviewPass({ username, origin }: { username: string; origin: string }) {
  const name = username.trim()
  const shown = name || PLACEHOLDER_NAME
  return (
    <SignupPass
      name={shown}
      ghost={!name}
      url={referralUrl(origin, normalizeCode(shown))}
      label="Preview of your invite pass"
      stub={
        <PassStub
          label="Your cut"
          value={
            <span
              className="pass-cut-value font-bold leading-[0.8]"
              style={{ fontFamily: humane.style.fontFamily }}
            >
              {formatPercent(REFERRER_SHARE)}
            </span>
          }
        />
      }
    />
  )
}

function InvitePass({
  invite,
  market,
  origin,
}: {
  invite: Extract<CodeLookup, { status: "valid" }>
  market: string | null
  origin: string
}) {
  const url = referralUrl(origin, invite.code)
  return (
    <SignupPass
      name={invite.referrer.username}
      url={market ? `${url}?m=${market}` : url}
      market={market}
      memberNumber={invite.memberNumber}
      label={`${invite.referrer.username}’s invite pass`}
      stub={
        <PassStub
          label="Invite code"
          value={
            <span className="flex max-w-full items-center gap-2 font-mono text-[0.9375rem] font-medium">
              <span className="truncate">{invite.code}</span>
              <Lock aria-hidden="true" className="size-3.5 shrink-0 opacity-70" />
            </span>
          }
        >
          <span className="text-[0.6875rem] font-medium leading-[1.35] opacity-70">Locked to this link</span>
        </PassStub>
      }
    />
  )
}

export function SignupScreen({
  invite,
  initialCode,
  demo,
  origin,
  market = null,
}: {
  invite: CodeLookup | null
  initialCode: string
  demo: SignupDemo | null
  origin: string
  market?: string | null
}) {
  const { address } = useSiteWallet()
  const registration = useRegistration()
  const router = useRouter()
  const { state, connect, start, clearError, signOut } = useWalletSignup(demo)
  const [attempted, setAttempted] = useState(false)
  const [code, setCode] = useState(initialCode)
  const [username, setUsername] = useState("")
  const [usernameConfirmed, setUsernameConfirmed] = useState(false)
  const [inviteAccepted, setInviteAccepted] = useState(false)
  const [warningSeen, setWarningSeen] = useState(false)
  const error = state.status === "error" ? state.message : null
  const usernameRejected =
    state.status === "error" && state.code !== null && USERNAME_ERROR_CODES.has(state.code)
  const submitting = state.status === "submitting"
  const finishing = submitting || state.status === "done"
  const registeredMe = registration.status === "registered" && !finishing ? registration.me : null
  const checking = registration.status === "loading" && attempted
  const connecting = state.status === "connecting" || checking
  const checkFailed = registration.status === "error"
  const hidden = registeredMe !== null || (registration.status === "loading" && !attempted)
  const validInvite = invite?.status === "valid" ? invite : null
  const eligibility = useEligibility(validInvite ? address : null, demo)
  const codeCheck = useInviteCheck(code, { address, code: username.trim() }, demo !== null)

  useEffect(() => {
    if (!registeredMe) return
    const notice = inviteNoticeFor(invite, registeredMe)
    rememberInviteNotice(notice)
    router.replace(inviteNoticeHref(notice))
  }, [registeredMe, invite, router])

  const retryCheck = () => {
    setAttempted(true)
    if (registration.status === "error") registration.retry()
  }

  const startConnect = () => {
    setAttempted(true)
    return connect()
  }

  const changeUsername = (value: string) => {
    setUsername(value)
    clearError()
  }

  const changeCode = (value: string) => {
    setCode(value)
    clearError()
  }

  const switchWallet = () => {
    setInviteAccepted(false)
    setWarningSeen(false)
    setUsernameConfirmed(false)
    setAttempted(false)
    void signOut()
  }

  if (hidden) return <SignupPending />

  if (validInvite) {
    const done = state.status === "done"
    const own = address !== null && validInvite.referrer.address.toLowerCase() === address.toLowerCase()
    const warned = own || (eligibility.status !== null && eligibility.status !== "eligible")
    const ready = inviteAccepted && address !== null && !eligibility.pending && (!warned || warningSeen)
    const step = done ? "done" : ready ? "username" : "invite"
    const accept = () => {
      if (address) {
        setWarningSeen(true)
        setInviteAccepted(true)
        return
      }
      void startConnect().then((connected) => connected && setInviteAccepted(true))
    }
    const aside =
      state.status === "done" ? (
        <SignupResultPass result={state.result} origin={origin} />
      ) : step === "username" ? (
        <PreviewPass username={username} origin={origin} />
      ) : (
        <InvitePass invite={validInvite} market={market} origin={origin} />
      )
    return (
      <SignupFrame
        step={step}
        current={INVITE_STEPS.indexOf(step)}
        total={INVITE_STEPS.length}
        address={done ? null : address}
        aside={aside}
        asideFirst={step !== "username"}
        onBack={step === "username" && !submitting ? () => setInviteAccepted(false) : undefined}
        onSignOut={switchWallet}
      >
        {state.status === "done" ? <SignupResult result={state.result} /> : null}
        {step === "invite" ? (
          <SignupInviteStep
            referrer={validInvite.referrer}
            code={validInvite.code}
            market={market}
            address={address}
            own={own}
            eligibility={eligibility.status}
            busyLabel={
              connecting
                ? "Connecting wallet…"
                : inviteAccepted && eligibility.pending
                  ? "Checking wallet…"
                  : null
            }
            error={checkFailed ? CHECK_FAILED_MESSAGE : error}
            actionLabel={checkFailed ? "Try again" : undefined}
            onConnect={() => (checkFailed ? retryCheck() : accept())}
          />
        ) : null}
        {step === "username" ? (
          <SignupUsernameStep
            value={username}
            busy={submitting}
            error={error}
            continueLabel={submitting ? "Creating your link…" : "Create my link"}
            onChange={changeUsername}
            onContinue={() => void start({ code: validInvite.code, username: username.trim() })}
          />
        ) : null}
      </SignupFrame>
    )
  }

  const step =
    state.status === "done"
      ? "done"
      : !address || connecting || checkFailed
        ? "connect"
        : !usernameConfirmed || usernameRejected
          ? "username"
          : "code"
  const aside =
    state.status === "done" ? (
      <SignupResultPass result={state.result} origin={origin} />
    ) : (
      <PreviewPass username={step === "connect" ? "" : username} origin={origin} />
    )
  return (
    <SignupFrame
      step={step}
      current={OPEN_STEPS.indexOf(step)}
      total={OPEN_STEPS.length}
      address={step === "done" ? null : address}
      aside={aside}
      asideFirst={step === "done"}
      onBack={step === "code" && !submitting ? () => setUsernameConfirmed(false) : undefined}
      onSignOut={switchWallet}
    >
      {state.status === "done" ? <SignupResult result={state.result} /> : null}
      {step === "username" ? (
        <SignupUsernameStep
          value={username}
          busy={false}
          error={usernameRejected ? error : null}
          onChange={changeUsername}
          onContinue={() => setUsernameConfirmed(true)}
        />
      ) : null}
      {step === "code" ? (
        <SignupCodeStep
          code={code}
          check={codeCheck}
          submitting={submitting}
          error={error}
          onChange={changeCode}
          onSubmit={(submitted) => void start({ code: submitted, username: username.trim() })}
        />
      ) : null}
      {step === "connect" ? (
        <SignupConnectStep
          invalidInvite={invite?.status === "unknown"}
          connecting={connecting}
          error={checkFailed ? CHECK_FAILED_MESSAGE : error}
          actionLabel={checkFailed ? "Try again" : undefined}
          onConnect={() => (checkFailed ? retryCheck() : void startConnect())}
        />
      ) : null}
    </SignupFrame>
  )
}
