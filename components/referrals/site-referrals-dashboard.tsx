"use client"

import { Suspense, useState, type ReactNode } from "react"
import { DemoTools } from "@/components/site/demo-tools"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/referral-site/api"
import type { SiteMe } from "@/lib/referral-site/types"
import { DEFAULT_EARNINGS_RANGE, type EarningsRange } from "./earnings-range"
import { CARD_CLASS, LOGIN_BUTTON_CLASS, MAIN_CLASS, SMALL_BUTTON_CLASS } from "./referral-styles"
import { SERIES_RANGES, SiteEarningsPanel } from "./site-earnings-panel"
import { SiteReferralCodeCard } from "./site-referral-code-card"
import { SiteReferralsActivity } from "./site-referrals-activity"
import {
  signupUrl,
  useSiteEarningsSeries,
  useSiteMe,
  useSiteReferrals,
  useSiteSession,
} from "./use-site-referrals"

function Prompt({ title, text, action }: { title: string; text: string; action: ReactNode }) {
  return (
    <main className={MAIN_CLASS}>
      <section className={`${CARD_CLASS} p-5`}>
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-xl">{title}</h1>
          <p className="text-[0.8125rem] text-ink-quiet">{text}</p>
          {action}
        </div>
      </section>
    </main>
  )
}

function LoadingDashboard() {
  return (
    <main className={MAIN_CLASS}>
      <section className={`${CARD_CLASS} flex flex-col gap-3 p-5`}>
        <Skeleton className="h-[1.25rem] w-[7rem] rounded-[0.25rem]" />
        <Skeleton className="h-[2.6rem] w-[11rem] rounded-[0.375rem]" />
      </section>
    </main>
  )
}

function Dashboard({ me }: { me: SiteMe }) {
  const [range, setRange] = useState<EarningsRange>(DEFAULT_EARNINGS_RANGE)
  const referrals = useSiteReferrals()
  const series = useSiteEarningsSeries(SERIES_RANGES[range])

  return (
    <main
      className={`${MAIN_CLASS} md:grid md:grid-cols-[minmax(0,1fr)_22.5rem] md:grid-rows-[minmax(22rem,auto)_1fr]`}
    >
      <section className={`${CARD_CLASS} flex min-w-0 flex-col overflow-hidden h-[33rem] md:h-auto`}>
        <SiteEarningsPanel
          series={series.data}
          range={range}
          onRangeChange={setRange}
          isError={series.isError}
          onRetry={() => void series.refetch()}
        />
      </section>
      <div className={`${CARD_CLASS} min-w-0`}>
        <SiteReferralCodeCard
          me={me}
          referrals={referrals.data}
          isError={referrals.isError}
          onRetry={() => void referrals.refetch()}
        />
      </div>
      <div className="flex min-w-0 flex-col md:col-span-2">
        <SiteReferralsActivity
          referrals={referrals.data}
          isError={referrals.isError}
          onRetry={() => void referrals.refetch()}
        />
      </div>
      <div className="empty:hidden md:col-span-2">
        <Suspense fallback={null}>
          <DemoTools />
        </Suspense>
      </div>
    </main>
  )
}

export function SiteReferralsDashboard() {
  const session = useSiteSession()
  const me = useSiteMe()

  if (!session.ready) return <LoadingDashboard />

  if (session.userId === null) {
    return (
      <Prompt
        title="Referrals"
        text="Log in to get your referral code and see what you’ve earned."
        action={
          <button type="button" className={LOGIN_BUTTON_CLASS} onClick={() => session.login()}>
            Login
          </button>
        }
      />
    )
  }

  if (me.error instanceof ApiError && me.error.code === "not_registered") {
    return (
      <Prompt
        title="Finish signing up"
        text="Pick a username to get your referral code. You’ll earn a share of Entropy’s fees on every trade your referrals make."
        action={
          <a href={signupUrl()} className={LOGIN_BUTTON_CLASS}>
            Finish signup
          </a>
        }
      />
    )
  }

  if (me.isError) {
    return (
      <Prompt
        title="Referrals"
        text="Couldn’t load your referral account."
        action={
          <button type="button" className={SMALL_BUTTON_CLASS} onClick={() => void me.refetch()}>
            Try again
          </button>
        }
      />
    )
  }

  return me.data ? <Dashboard me={me.data} /> : <LoadingDashboard />
}
