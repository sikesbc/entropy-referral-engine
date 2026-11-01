import type { ReactNode } from "react"
import { PASS_CSS } from "@/components/site/referrals/pass/pass-css"
import { mainSkin, skinFor } from "@/components/site/referrals/pass/skins"
import { humane } from "@/components/onboarding/humane-font"
import { displayUrl } from "@/lib/referral-site/config"
import { cn } from "@/lib/utils"

function nameFit(name: string): string {
  return `${(100 / Math.max(name.length * 0.24, 1)).toFixed(2)}cqi`
}

export function PassStub({
  label,
  value,
  children,
}: {
  label: string
  value: ReactNode
  children?: ReactNode
}) {
  return (
    <span className="pass-cut">
      <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] opacity-60">{label}</span>
      {value}
      {children}
    </span>
  )
}

export function SignupPass({
  name,
  url,
  market,
  memberNumber,
  ghost = false,
  label,
  stub,
}: {
  name: string
  url: string
  market?: string | null
  memberNumber?: number
  ghost?: boolean
  label: string
  stub: ReactNode
}) {
  const skin = market ? skinFor(market) : undefined
  const art = skin ?? mainSkin
  return (
    <div className="pass-stage pass-rise">
      <style href="pass-styles" precedence="default">
        {PASS_CSS}
      </style>
      <style href={`ticket-skin-${art.id}`} precedence="default">
        {art.css}
      </style>
      <figure
        className="pass-card"
        data-skin={art.id}
        data-state="unlocked"
        data-share="below"
        aria-label={label}
      >
        <div className="pass-ticket" style={{ cursor: "default" }}>
          <div className="pass-face pass-body @container flex min-w-0 flex-1 flex-col justify-between gap-7 p-6 sm:gap-10 sm:p-9">
            <art.Art part="body" />
            <div className="relative flex items-start justify-between gap-4">
              <span className="flex items-center gap-2.5">
                <img src="/entropy-logo-white.svg" alt="" className="pass-brand h-[1.05rem] w-auto" />
                {skin ? (
                  <img
                    src={skin.logo}
                    alt=""
                    className="pass-market-logo h-[1.4rem] w-auto rounded-[0.3rem]"
                  />
                ) : null}
                <span className="whitespace-nowrap font-mono text-[0.625rem] font-medium uppercase tracking-[0.22em]">
                  {skin ? `${skin.id} pass` : "Invite pass"}
                </span>
              </span>
              {memberNumber === undefined ? null : (
                <span className="hidden whitespace-nowrap font-mono text-[0.625rem] uppercase tracking-[0.14em] opacity-70 @2xs:inline">
                  {`Member #${String(memberNumber).padStart(4, "0")}`}
                </span>
              )}
            </div>
            <div className="relative flex min-w-0 flex-col gap-2">
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] opacity-70">
                {skin ? `Trade ${skin.name} with` : "Trade io with"}
              </span>
              <span
                className={cn(
                  "pass-name block font-bold leading-[0.78] transition-opacity duration-200",
                  ghost && "opacity-30",
                )}
                style={{
                  fontFamily: humane.style.fontFamily,
                  fontSize: `min(9.5rem, ${nameFit(name)})`,
                  ["--name-fit" as string]: nameFit(name),
                }}
              >
                {name}
              </span>
            </div>
            <dl className="relative flex min-w-0 flex-col gap-1">
              <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] opacity-60">Link</dt>
              <dd className="truncate font-mono text-[0.75rem] font-medium">{displayUrl(url)}</dd>
            </dl>
          </div>
          <div className="pass-face pass-stub">
            <art.Art part="stub" />
            <span className="pass-perf" aria-hidden="true" />
            {stub}
          </div>
        </div>
      </figure>
    </div>
  )
}
