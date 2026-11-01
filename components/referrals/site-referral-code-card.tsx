"use client"

import { useEffect, useState } from "react"
import { Check, Share } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCount, formatExactUsd, formatPercent, formatUsd } from "@/lib/referral-site/format"
import { shareData } from "@/lib/referral-site/share"
import type { ReferralsResponse, SiteMe } from "@/lib/referral-site/types"
import { CopyLinkButton } from "./copy-link-button"
import { ReferralStatRow } from "./referral-stat-row"
import { LARGE_BUTTON_CLASS, SMALL_BUTTON_CLASS } from "./referral-styles"
import { siteReferralLink } from "./use-site-referrals"

const COPIED_MS = 1500

const STAT_VALUE_CLASS =
  "font-mono text-[1.0625rem] font-medium leading-[1.375rem] tabular-nums tracking-[-0.0125em] text-ink"

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

function ShareLinkButton({ getLink }: { getLink: () => string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(id)
  }, [copied])

  const share = async () => {
    const link = getLink()
    const data = shareData(link)
    if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data)
        return
      } catch (error) {
        if (isAbort(error)) return
      }
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      window.prompt("Copy this", link)
    }
  }

  return (
    <button type="button" onClick={() => void share()} className={LARGE_BUTTON_CLASS}>
      <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
        {copied ? (
          <Check size="1rem" aria-hidden="true" className="text-up" />
        ) : (
          <Share size="1rem" aria-hidden="true" />
        )}
        {copied ? "Copied" : "Share"}
      </span>
    </button>
  )
}

function StatSkeleton() {
  return <Skeleton className="h-[1.125rem] w-[4.5rem] rounded-[0.25rem]" />
}

export function SiteReferralCodeCard({
  me,
  referrals,
  isError,
  onRetry,
}: {
  me: SiteMe
  referrals: ReferralsResponse | undefined
  isError: boolean
  onRetry: () => void
}) {
  const getLink = () => siteReferralLink(me.code)

  return (
    <aside aria-label="Your referral code" className="flex h-full flex-col gap-2 px-[1.375rem] py-4">
      <div className="flex flex-col gap-2">
        <p className="font-sans text-[0.9375rem] font-medium text-ink-soft">Your code</p>
        <p className="truncate font-mono text-[2rem] font-medium leading-none tracking-[-0.04em] text-ink">
          {me.code}
        </p>
      </div>
      <div className="flex flex-col">
        <ReferralStatRow label="Your share">
          {referrals ? (
            <span className="flex items-baseline gap-1.5">
              <b className={STAT_VALUE_CLASS}>{formatPercent(referrals.rates.referrerShare)}</b>
              <span className="font-sans text-[0.8125rem] text-ink-quiet">of Entropy’s fees</span>
            </span>
          ) : (
            <StatSkeleton />
          )}
        </ReferralStatRow>
        <ReferralStatRow label="Referred users">
          {referrals ? (
            <b className={STAT_VALUE_CLASS}>{formatCount(referrals.totals.referredCount)}</b>
          ) : (
            <StatSkeleton />
          )}
        </ReferralStatRow>
        <ReferralStatRow label="Referred user trading volume (io)">
          {referrals ? (
            <b className={STAT_VALUE_CLASS} title={formatExactUsd(referrals.totals.volumeUsd)}>
              {formatUsd(referrals.totals.volumeUsd)}
            </b>
          ) : (
            <StatSkeleton />
          )}
        </ReferralStatRow>
      </div>
      <div className="flex min-h-8 flex-1 items-center justify-center">
        {isError && !referrals ? (
          <div className="flex items-center gap-3">
            <p className="text-[0.8125rem] text-ink-quiet">Couldn’t load your referrals.</p>
            <button type="button" onClick={onRetry} className={SMALL_BUTTON_CLASS}>
              Try again
            </button>
          </div>
        ) : me.referredBy ? (
          <p className="inline-flex h-7 max-w-full -translate-y-2 items-center truncate rounded-full bg-panel-2 px-3 font-sans text-[0.8125rem] text-ink-quiet dark:bg-panel-3">
            Referred by <span className="ml-1 text-ink-soft">{me.referredBy.displayName}</span>
          </p>
        ) : (
          <p className="-translate-y-2 font-sans text-[0.8125rem] text-ink-quiet">
            Referrers are set when you sign up
          </p>
        )}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2.5">
        <CopyLinkButton getLink={getLink} />
        <ShareLinkButton getLink={getLink} />
      </div>
    </aside>
  )
}
