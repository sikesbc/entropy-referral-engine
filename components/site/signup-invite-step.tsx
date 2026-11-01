import { Info, Lock } from "lucide-react"
import Link from "next/link"
import { firstRunDelay } from "@/components/onboarding/first-run-delay"
import { skinFor } from "@/components/site/referrals/pass/skins"
import { marketLogoSrc } from "@/lib/assets"
import { shortAddress } from "@/lib/format/address"
import type { EligibilityStatus, Referrer } from "@/lib/referral-site/types"
import {
  ReceiptLine,
  SIGNUP_PRIMARY_CLASS,
  SignupActions,
  SignupError,
  SignupHeading,
  SignupLead,
} from "./signup-text"

const INVITE_MARKETS = ["io:OAI", "io:ANTH", "io:NVDA", "io:SNDK", "io:TCNT"]

const ELIGIBILITY_NOTES: Partial<Record<EligibilityStatus, string>> = {
  has_traded: "This wallet already traded on Entropy, so this invite won’t apply.",
  has_referrer: "This wallet already has a referrer.",
  registered: "This wallet already signed up.",
}

function Note({ children }: { children: string }) {
  return (
    <p role="status" className="flex items-start gap-2 text-[0.875rem] leading-[1.45] text-ink">
      <Info aria-hidden="true" className="mt-[0.15em] size-4 shrink-0 text-ink-soft" />
      {children}
    </p>
  )
}

export function SignupInviteStep({
  referrer,
  code,
  market,
  address,
  own,
  eligibility,
  busyLabel,
  error,
  actionLabel,
  onConnect,
}: {
  referrer: Referrer
  code: string
  market: string | null
  address: string | null
  own: boolean
  eligibility: EligibilityStatus | null
  busyLabel: string | null
  error: string | null
  actionLabel?: string
  onConnect: () => void
}) {
  const marketName = market ? (skinFor(market)?.name ?? null) : null
  const note = own ? "This is your link." : eligibility ? ELIGIBILITY_NOTES[eligibility] : undefined
  const done = own || eligibility === "registered"
  const label =
    busyLabel ??
    actionLabel ??
    (!address ? "Connect wallet" : note ? "Continue anyway" : `Continue as ${shortAddress(address)}`)

  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <SignupHeading>You’re invited</SignupHeading>
        <SignupLead>
          {`${referrer.username} invited you to trade ${marketName ? `${marketName} and other io markets` : "io markets"} on Entropy, perpetual futures that are hard to trade elsewhere.`}
        </SignupLead>
        <div className="first-run-item flex items-center gap-3" style={firstRunDelay(120)}>
          <span className="flex shrink-0 -space-x-1.5">
            {INVITE_MARKETS.map((coin) => (
              <img
                key={coin}
                src={marketLogoSrc(coin)}
                alt=""
                aria-hidden="true"
                className="size-6 rounded-full ring-2 ring-panel"
              />
            ))}
          </span>
          <span className="whitespace-nowrap text-[0.8125rem] text-ink-quiet">and more io markets</span>
        </div>
      </div>
      <div className="first-run-item flex w-full flex-col gap-3 text-[0.875rem]" style={firstRunDelay(160)}>
        <dl className="flex flex-col gap-2.5">
          <ReceiptLine label="Invite code">
            <span className="truncate font-mono text-[0.8125rem]">{code}</span>
            <Lock aria-label="Locked to this link" className="size-3 shrink-0 text-ink-quiet" />
          </ReceiptLine>
        </dl>
        <p className="text-[0.8125rem] leading-[1.5] text-ink-quiet">
          {`${referrer.username} earns a share of the fees Entropy makes on your io trades.`}
        </p>
      </div>
      <div className="first-run-item flex w-full flex-col gap-3" style={firstRunDelay(200)}>
        {note ? <Note>{note}</Note> : null}
        <SignupError message={error} />
        <SignupActions delay={0}>
          {done ? (
            <Link href="/referrals" className={SIGNUP_PRIMARY_CLASS}>
              Go to your referrals
            </Link>
          ) : (
            <button
              type="button"
              aria-busy={busyLabel ? true : undefined}
              onClick={() => busyLabel || onConnect()}
              className={SIGNUP_PRIMARY_CLASS}
            >
              {label}
            </button>
          )}
        </SignupActions>
      </div>
    </>
  )
}
