"use client"

import { useState } from "react"
import { Share } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ApplyReferralCodeForm } from "./apply-referral-code-form"
import { CopyLinkButton } from "./copy-link-button"
import { formatCount, formatRate, formatVolume } from "./referral-format"
import { referralLink } from "./referral-link"
import { ReferralStatRow } from "./referral-stat-row"
import { ReferralStatValue } from "./referral-stat-value"
import { LARGE_BUTTON_CLASS, SMALL_BUTTON_CLASS } from "./referral-styles"
import { ShareReferralDialog } from "./share-referral-dialog"
import type { ReferralOverview } from "./use-referral-overview"

const DEFAULT_USERNAME = "Entropy trader"

export function ReferralCodeCard({ overview }: { overview: ReferralOverview }) {
  const [shareOpen, setShareOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { code, attribution, isLoading, isError } = overview
  const getLink = code ? () => referralLink(window.location.origin, code) : null
  const referredBy = attribution ? attribution.partner.displayName || attribution.sourceSlug : null

  return (
    <>
      <aside aria-label="Your referral code" className="flex h-full flex-col gap-2 px-[1.375rem] py-4">
        <div className="flex flex-col gap-2">
          <p className="font-sans text-[0.9375rem] font-medium text-ink-soft">Your code</p>
          {code ? (
            <p className="truncate font-mono text-[2rem] font-medium leading-none tracking-[-0.04em] text-ink">
              {code}
            </p>
          ) : isError ? (
            <div className="flex items-center gap-3">
              <p className="text-[0.8125rem] text-ink-quiet">Couldn’t load your referral account.</p>
              <button type="button" onClick={overview.retry} className={SMALL_BUTTON_CLASS}>
                Try again
              </button>
            </div>
          ) : (
            <Skeleton className="h-8 w-[9rem] rounded-[0.375rem]" />
          )}
        </div>
        <div className="flex flex-col">
          <ReferralStatRow label="Rebate">
            <ReferralStatValue value={overview.rebateRate} format={formatRate} isLoading={isLoading} />
          </ReferralStatRow>
          <ReferralStatRow label="Commission">
            <ReferralStatValue value={overview.commissionRate} format={formatRate} isLoading={isLoading} />
          </ReferralStatRow>
          <ReferralStatRow label="Referred users">
            <ReferralStatValue value={overview.referredUsers} format={formatCount} isLoading={isLoading} />
          </ReferralStatRow>
          <ReferralStatRow label="Referred user trading volume">
            <ReferralStatValue value={overview.referredVolume} format={formatVolume} isLoading={isLoading} />
          </ReferralStatRow>
        </div>
        {overview.canApplyCode || referredBy ? (
          <div className="flex min-h-8 flex-1 items-center justify-center">
            {overview.canApplyCode ? (
              <ApplyReferralCodeForm onError={setError} />
            ) : (
              <p className="inline-flex h-7 max-w-full -translate-y-2 items-center truncate rounded-full bg-panel-2 px-3 font-sans text-[0.8125rem] text-ink-quiet dark:bg-panel-3">
                Referred by <span className="ml-1 text-ink-soft">{referredBy}</span>
              </p>
            )}
          </div>
        ) : null}
        <div className="mt-auto grid grid-cols-2 gap-2.5">
          <CopyLinkButton getLink={getLink} />
          <button
            type="button"
            disabled={!code}
            onClick={() => setShareOpen(true)}
            className={LARGE_BUTTON_CLASS}
          >
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
              <Share size="1rem" aria-hidden="true" />
              Share
            </span>
          </button>
        </div>
      </aside>
      {error ? (
        <p role="alert" className="px-[1.375rem] pb-4 text-[0.8125rem] text-down">
          {error}
        </p>
      ) : null}
      <ShareReferralDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        username={code ?? DEFAULT_USERNAME}
        link={shareOpen && getLink ? getLink() : null}
        tier={overview.tier}
        maxSortOrder={overview.maxTierSortOrder}
      />
    </>
  )
}
