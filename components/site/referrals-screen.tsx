"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type CSSProperties, useEffect, useMemo, useState, type ReactNode } from "react"
import { usePrefetchEmailSettings } from "@/components/referrals/email/use-email-settings"
import { HEADER_PILL_TARGET } from "@/components/referrals/intro/header-pill"
import { INTRO_STEPS } from "@/components/referrals/intro/intro-steps"
import { IntroTour } from "@/components/referrals/intro/intro-tour"
import { referralUrl } from "@/lib/referral-site/config"
import type { ReferralsDemo } from "@/lib/referral-site/demo"
import {
  applyMarketDemo,
  getReferrals as mockReferrals,
  type MarketDemoAction,
} from "@/lib/referral-site/mock-api"
import { DEMO_ME } from "@/lib/referral-site/mock-data"
import { useCachedSession, useReferrals } from "@/lib/referral-site/queries"
import type { ReferralMarket, ReferralsResponse, SiteMe } from "@/lib/referral-site/types"
import { useRegistration } from "@/lib/referral-site/use-registration"
import { ConnectWalletButton } from "./connect-wallet-button"
import { DemoMarketTools, DemoTools } from "./demo-tools"
import { InviteIgnoredNote } from "./invite-ignored-note"
import { ReferralsView } from "./referrals/referrals-view"
import { SignedInOnly } from "./signed-in-only"

export const INTRO_ROOT_ID = "referrals-intro-root"

function Intro() {
  return <IntroTour steps={INTRO_STEPS} pillTarget={HEADER_PILL_TARGET} />
}

function viewMe(me: Omit<SiteMe, "referredBy">, origin: string) {
  return {
    url: referralUrl(origin, me.code),
    code: me.code,
    username: me.username,
    address: me.address,
    memberNumber: me.memberNumber,
  }
}

function StatusShell({ label, busy, children }: { label: string; busy?: boolean; children?: ReactNode }) {
  return (
    <main
      aria-busy={busy || undefined}
      className="mx-auto flex w-full max-w-[80rem] flex-1 flex-col justify-center gap-5 px-5 pb-28 pt-8 sm:px-12 sm:pt-14"
    >
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-quiet">{label}</span>
      {children}
    </main>
  )
}

function StatusCopy({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex max-w-[30rem] flex-col gap-3">
      <h1 className="text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] text-ink">{title}</h1>
      <p className="text-[0.9375rem] leading-[1.55] text-ink-quiet">{body}</p>
    </div>
  )
}

const SKELETON_SHIMMER = `
.referrals-skeleton .sk {
  position: relative;
  overflow: hidden;
  background: var(--color-line-soft);
  border-radius: 0.375rem;
}
.referrals-skeleton .sk::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-line) 70%, transparent), transparent);
  animation: referrals-skeleton-shimmer 1.6s ease-in-out infinite;
}
@keyframes referrals-skeleton-shimmer {
  to { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .referrals-skeleton .sk::after { animation: none; display: none; }
}
`

function Bar({ className, style }: { className: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`sk block ${className}`} style={style} />
}

function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your passes"
      className="referrals-skeleton mx-auto w-full max-w-[80rem] px-5 pb-28 pt-8 sm:px-12 sm:pt-14"
    >
      <style>{SKELETON_SHIMMER}</style>
      <div className="grid grid-cols-1 gap-y-12 xl:grid-cols-[minmax(37rem,42rem)_minmax(18rem,1fr)] xl:grid-rows-[auto_auto] xl:items-start xl:gap-x-[3rem] xl:gap-y-14 2xl:gap-x-[5rem]">
        <div className="flex w-full min-w-0 max-w-[42rem] flex-col gap-[1.1rem] xl:col-start-1 xl:row-start-1">
          <Bar className="aspect-[840/362] w-full !rounded-[1.25rem]" />
          <div className="flex items-center gap-5">
            <Bar className="h-[2.75rem] w-[7.9rem] !rounded-xl" />
            {[3.5, 3.5, 4, 5, 5.25].map((width, index) => (
              <Bar key={index} className="hidden h-[0.8rem] sm:block" style={{ width: `${width}rem` }} />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col xl:col-start-2 xl:row-start-1">
          <Bar className="h-[0.95rem] w-32" />
          <Bar className="mt-5 h-[8rem] w-[80%]" />
          <Bar className="mt-6 h-[1.4rem] w-40" />
          <div className="mt-4 flex h-[5.45rem] items-center gap-5">
            <Bar className="h-[4.7rem] w-[8rem] !rounded-lg" />
            <div className="flex flex-1 flex-col gap-2.5">
              <Bar className="h-4 w-[85%]" />
              <Bar className="h-4 w-[45%]" />
            </div>
          </div>
        </div>
        <div className="@container min-w-0 xl:col-start-1 xl:row-start-2">
          <ul className="grid grid-cols-2 gap-x-3 gap-y-4 @sm:grid-cols-3 @sm:gap-x-4 @sm:gap-y-5 @xl:grid-cols-4 @3xl:grid-cols-5">
            {Array.from({ length: 9 }, (_, index) => (
              <li
                key={index}
                className={
                  index === 0
                    ? "col-span-2 row-span-2 @sm:col-span-1 @sm:row-span-1 @xl:col-span-2 @xl:row-span-2"
                    : undefined
                }
              >
                <Bar className="aspect-[195/115] h-full w-full !rounded-lg" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-w-0 flex-col gap-5 xl:col-start-2 xl:row-start-2">
          <div className="flex min-h-7 items-center justify-between gap-4">
            <Bar className="h-5 w-24" />
            <Bar className="h-4 w-40" />
          </div>
          <ul className="flex flex-col">
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="flex h-[3.75rem] items-center gap-4 border-b border-line-soft">
                <Bar className="size-6 shrink-0 !rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Bar className="h-4 w-[55%]" />
                  <Bar className="h-3 w-[35%]" />
                </div>
                <Bar className="h-4 w-16" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <StatusShell label="Referrals">
      <StatusCopy
        title="Couldn’t load your referrals"
        body="Something went wrong on our side. Your link and earnings are safe."
      />
      <button
        type="button"
        onClick={onRetry}
        className="self-start text-[0.9375rem] font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
      >
        Try again
      </button>
    </StatusShell>
  )
}

function SignedOut() {
  return (
    <StatusShell label="Referrals">
      <StatusCopy
        title="See what your link has earned"
        body="Connect the wallet you signed up with to see your friends and earnings."
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="w-full max-w-[14rem]">
          <ConnectWalletButton size="large" />
        </div>
        <Link href="/" className="text-[0.875rem] text-ink-quiet transition-colors hover:text-ink-soft">
          New here? Get your link
        </Link>
      </div>
    </StatusShell>
  )
}

function DemoReferrals({ demo, origin }: { demo: ReferralsDemo; origin: string }) {
  const base = useMemo(() => mockReferrals(demo), [demo])
  const [markets, setMarkets] = useState<ReferralMarket[] | null>(null)
  const data = useMemo(() => (markets ? { ...base, markets } : base), [base, markets])
  const me = useMemo(() => viewMe(DEMO_ME, origin), [origin])

  const act = (action: MarketDemoAction) => {
    const result = applyMarketDemo(data.markets, action)
    setMarkets(result.markets)
    return result.market
  }

  return (
    <>
      <ReferralsView me={me} data={data} />
      <DemoMarketTools onAction={act} />
      <Intro />
    </>
  )
}

function LiveReferrals({
  me,
  origin,
  data,
  onRetry,
}: {
  me: SiteMe
  origin: string
  data: ReferralsResponse | undefined
  onRetry: (() => void) | null
}) {
  const viewer = useMemo(() => viewMe(me, origin), [me, origin])
  usePrefetchEmailSettings()

  if (onRetry) return <LoadError onRetry={onRetry} />
  if (!data) return <Loading />
  return (
    <>
      <ReferralsView me={viewer} data={data} />
      <DemoTools />
      <Intro />
    </>
  )
}

function LiveScreen({ origin, signedOut }: { origin: string; signedOut?: ReactNode }) {
  const registration = useRegistration()
  const referrals = useReferrals()
  const cached = useCachedSession()
  const router = useRouter()
  const leaving =
    !signedOut && (registration.status === "signedOut" || registration.status === "unregistered")

  useEffect(() => {
    if (leaving) router.replace("/")
  }, [leaving, router])

  if (signedOut && registration.status === "signedOut") return signedOut
  if (registration.status === "error") return <LoadError onRetry={registration.retry} />
  const live = registration.status === "registered"
  const me = live ? registration.me : registration.status === "loading" ? cached?.me : undefined
  if (!me) return <Loading />
  const data = live ? referrals.data : (cached?.referrals ?? undefined)
  const onRetry = live && referrals.isError && !referrals.data ? () => void referrals.refetch() : null
  return (
    <>
      {live && <InviteIgnoredNote />}
      <LiveReferrals me={me} origin={origin} data={data} onRetry={onRetry} />
    </>
  )
}

function DemoScreen({
  origin,
  demo,
  signedOut,
}: {
  origin: string
  demo: ReferralsDemo
  signedOut?: ReactNode
}) {
  return (
    <SignedInOnly fallback={signedOut ?? <SignedOut />}>
      <InviteIgnoredNote />
      <DemoReferrals demo={demo} origin={origin} />
    </SignedInOnly>
  )
}

export function ReferralsScreen({
  origin,
  demo,
  signedOut,
}: {
  origin: string
  demo: ReferralsDemo | null
  signedOut?: ReactNode
}) {
  return (
    <>
      {demo ? (
        <DemoScreen origin={origin} demo={demo} signedOut={signedOut} />
      ) : (
        <LiveScreen origin={origin} signedOut={signedOut} />
      )}
      <div id={INTRO_ROOT_ID} />
    </>
  )
}
