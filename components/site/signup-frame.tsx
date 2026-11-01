"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, type ReactNode } from "react"
import { shortAddress } from "@/lib/format/address"
import { cn } from "@/lib/utils"

const LINK_CLASS =
  "inline-flex items-center gap-1.5 rounded-[0.25rem] text-[0.8125rem] text-ink-quiet underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-soft"

function useStepFocus(step: string) {
  const ref = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const target = ref.current?.querySelector<HTMLElement>("input:not([readonly]), h1")
    target?.focus({ preventScroll: true })
  }, [step])
  return ref
}

export function SignupFrame({
  step,
  current,
  total,
  address,
  aside,
  asideFirst = false,
  onBack,
  onSignOut,
  children,
}: {
  step: string
  current: number
  total: number
  address: string | null
  aside?: ReactNode
  asideFirst?: boolean
  onBack?: () => void
  onSignOut?: () => void
  children: ReactNode
}) {
  const stepRef = useStepFocus(step)
  return (
    <div className="entropy-trade flex min-h-dvh flex-col bg-panel text-ink">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-5 sm:px-12">
        <Link
          href="/"
          aria-label="Entropy Referrals home"
          className="flex shrink-0 items-center gap-2.5 rounded-[0.25rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink-soft"
        >
          <img className="h-5 w-6" alt="" src="/entropy-logo-white.svg" />
          <span className="text-[0.9375rem] font-medium tracking-[-0.02em] text-ink">Referrals</span>
        </Link>
        {address && onSignOut ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden font-mono text-[0.75rem] text-ink-soft sm:inline">
              {shortAddress(address)}
            </span>
            <button type="button" onClick={onSignOut} className={LINK_CLASS}>
              Use a different wallet
            </button>
          </div>
        ) : null}
      </header>
      <main className="mx-auto grid w-full max-w-[80rem] flex-1 grid-cols-1 content-center items-center gap-x-[5rem] gap-y-10 px-5 pb-16 pt-8 sm:px-12 sm:pt-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:pb-20">
        <div key={step} ref={stepRef} className="flex min-w-0 flex-col items-start gap-7">
          <nav aria-label="Signup steps" className="flex w-full items-center justify-between gap-4">
            {onBack ? (
              <button type="button" onClick={onBack} className={LINK_CLASS}>
                <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={2} />
                Back
              </button>
            ) : null}
            <span
              role="progressbar"
              aria-label={`Step ${current + 1} of ${total}`}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={current + 1}
              className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-quiet"
            >
              <span aria-hidden="true">{`Step ${current + 1} of ${total}`}</span>
              <span aria-hidden="true" className="flex gap-1">
                {Array.from({ length: total }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-[3px] w-4 rounded-full transition-colors duration-200",
                      index <= current ? "bg-ink-soft" : "bg-panel-3",
                    )}
                  />
                ))}
              </span>
            </span>
          </nav>
          {children}
        </div>
        {aside ? (
          <div
            className={cn(
              "min-w-0 w-full max-w-[42rem] lg:justify-self-end",
              asideFirst && "order-first lg:order-none",
            )}
          >
            {aside}
          </div>
        ) : null}
      </main>
    </div>
  )
}

export function SignupPending() {
  return <main aria-busy="true" className="entropy-trade min-h-dvh bg-panel" />
}
