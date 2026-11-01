import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Pass } from "@/components/site/referrals/pass/pass"
import { REFERRER_SHARE, referralUrl, TRADE_URL } from "@/lib/referral-site/config"
import type { Attribution, SignupResponse } from "@/lib/referral-site/types"
import {
  SIGNUP_QUIET_CLASS,
  SIGNUP_SECONDARY_CLASS,
  SignupActions,
  SignupHeading,
  SignupLead,
} from "./signup-text"

function attributionLine(attribution: Attribution): string {
  if (attribution.status === "attributed")
    return `You joined through ${attribution.referrer.displayName}’s invite.`
  if (attribution.status === "no_code") return "Your link is ready. Share it with traders who are new to io."
  if (attribution.reason === "existing_trader") {
    const who = attribution.referrer ? attribution.referrer.displayName : "your inviter"
    return `This wallet traded io before, so ${who} gets no credit. Invites only count for traders new to io.`
  }
  if (attribution.reason === "self_referral") return "You can’t invite yourself, so no one gets credit."
  return `No one has the code “${attribution.code}”, so no one gets credit.`
}

function outcomeLine(result: SignupResponse): string {
  if (result.status === "registered") return attributionLine(result.attribution)
  const already = "This wallet already has a link."
  return result.ignoredCode
    ? `${already} Invites only apply at signup, so “${result.ignoredCode}” wasn’t used.`
    : `${already} Your earnings and friends are on your referrals page.`
}

export function SignupResult({ result }: { result: SignupResponse }) {
  return (
    <>
      <div className="flex flex-col items-start gap-4" aria-live="polite">
        <SignupHeading>You’re in</SignupHeading>
        <SignupLead>{outcomeLine(result)}</SignupLead>
      </div>
      <SignupActions>
        <Link href="/referrals" className={SIGNUP_SECONDARY_CLASS}>
          Go to your referrals
        </Link>
        <a href={TRADE_URL} className={SIGNUP_QUIET_CLASS}>
          Trade on Entropy
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
      </SignupActions>
    </>
  )
}

export function SignupResultPass({ result, origin }: { result: SignupResponse; origin: string }) {
  const { me } = result
  return (
    <div className="pass-fit">
      <Pass
        share="below"
        username={me.username}
        url={referralUrl(origin, me.code)}
        code={me.code}
        address={me.address}
        referrerShare={REFERRER_SHARE}
        memberNumber={me.memberNumber}
      />
    </div>
  )
}
