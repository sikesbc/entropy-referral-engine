import { formatPercent } from "@/lib/referral-site/format"
import { REFERRER_SHARE } from "@/lib/referral-site/config"
import { InvalidInvite } from "./invalid-invite"
import { SIGNUP_PRIMARY_CLASS, SignupActions, SignupError, SignupHeading, SignupLead } from "./signup-text"

export function SignupConnectStep({
  invalidInvite,
  connecting,
  error,
  actionLabel = "Connect wallet",
  onConnect,
}: {
  invalidInvite: boolean
  connecting: boolean
  error: string | null
  actionLabel?: string
  onConnect: () => void
}) {
  return (
    <>
      {invalidInvite ? <InvalidInvite /> : null}
      <div className="flex flex-col items-start gap-4">
        <SignupHeading>Get your link</SignupHeading>
        <SignupLead>
          {`Invite friends and get ${formatPercent(REFERRER_SHARE)} of the fees Entropy makes on their io trades.`}
        </SignupLead>
        <SignupLead quiet delay={120}>
          Connect the wallet you trade with on Hyperliquid. Signing in is free and sends no transaction.
        </SignupLead>
      </div>
      <div className="flex w-full flex-col gap-3">
        <SignupError message={error} />
        <SignupActions>
          <button
            type="button"
            aria-busy={connecting || undefined}
            onClick={() => connecting || onConnect()}
            className={SIGNUP_PRIMARY_CLASS}
          >
            {connecting ? "Connecting wallet…" : actionLabel}
          </button>
          <span className="text-center text-[0.8125rem] text-ink-quiet sm:text-left">
            Signed up already? Connect the same wallet.
          </span>
        </SignupActions>
      </div>
    </>
  )
}
