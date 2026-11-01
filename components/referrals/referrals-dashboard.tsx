"use client"

import { EarningsPanel } from "./earnings-panel"
import { ReferralCodeCard } from "./referral-code-card"
import { CARD_CLASS, MAIN_CLASS } from "./referral-styles"
import { ReferralsActivity } from "./referrals-activity"
import { useReferralOverview } from "./use-referral-overview"

export function ReferralsDashboard() {
  const overview = useReferralOverview()

  return (
    <main
      className={`${MAIN_CLASS} md:grid md:grid-cols-[minmax(0,1fr)_22.5rem] md:grid-rows-[minmax(22rem,auto)_1fr]`}
    >
      <section className={`${CARD_CLASS} flex min-w-0 flex-col overflow-hidden h-[33rem] md:h-auto`}>
        <EarningsPanel
          lifetime={overview.lifetimeEarned}
          history={overview.history}
          isError={overview.isError}
          onRetry={overview.retry}
        />
      </section>
      <div className={`${CARD_CLASS} min-w-0`}>
        <ReferralCodeCard overview={overview} />
      </div>
      {overview.code ? (
        <div className="flex min-w-0 flex-col md:col-span-2">
          <ReferralsActivity
            referredCount={overview.referredUsers}
            commissionRate={overview.commissionRate}
            payouts={overview.payouts}
          />
        </div>
      ) : null}
    </main>
  )
}
