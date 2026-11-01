import { CircleAlert } from "lucide-react"
import type { ReactNode } from "react"
import { firstRunDelay } from "@/components/onboarding/first-run-delay"
import { humane } from "@/components/onboarding/humane-font"
import { cn } from "@/lib/utils"

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-soft"

export const SIGNUP_PRIMARY_CLASS = cn(
  "lite-primary inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[0.625rem] px-6 text-[0.9375rem] aria-busy:cursor-progress sm:w-auto",
  "disabled:cursor-not-allowed disabled:bg-panel-3 disabled:font-medium disabled:text-ink-quiet",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9a7a]",
)

export const SIGNUP_SECONDARY_CLASS = cn(
  "lite-raised-chip inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[0.625rem] px-6 text-[0.9375rem] font-medium text-ink sm:w-auto",
  FOCUS_RING,
)

export const SIGNUP_QUIET_CLASS = cn(
  "inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-[0.375rem] px-1 text-[0.875rem] text-ink-quiet underline-offset-4 transition-colors hover:text-ink hover:underline",
  FOCUS_RING,
)

export const SIGNUP_INPUT_CLASS = cn(
  "h-12 w-full rounded-[0.625rem] bg-panel-2 px-4 font-mono text-[0.875rem] text-ink ring-1 ring-inset ring-line transition-shadow placeholder:text-ink-ghost",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-soft aria-invalid:ring-down/70 read-only:text-ink-soft",
)

export const SIGNUP_LABEL_CLASS = "font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-quiet"

export function SignupHeading({ children }: { children: string }) {
  return (
    <h1
      tabIndex={-1}
      className="first-run-item text-[4.25rem] font-bold leading-[0.82] text-ink outline-none sm:text-[5.5rem]"
      style={{ fontFamily: humane.style.fontFamily, ...firstRunDelay(0) }}
    >
      {children}
    </h1>
  )
}

export function SignupLead({
  children,
  delay = 80,
  quiet = false,
}: {
  children: ReactNode
  delay?: number
  quiet?: boolean
}) {
  return (
    <p
      className={cn(
        "first-run-item max-w-[26rem] text-pretty leading-[1.5]",
        quiet ? "text-[0.8125rem] text-ink-quiet" : "text-[0.9375rem] text-ink-soft",
      )}
      style={firstRunDelay(delay)}
    >
      {children}
    </p>
  )
}

export function SignupActions({ children, delay = 160 }: { children: ReactNode; delay?: number }) {
  return (
    <div
      className="first-run-item flex w-full flex-col items-stretch gap-x-5 gap-y-2 sm:flex-row sm:items-center"
      style={firstRunDelay(delay)}
    >
      {children}
    </div>
  )
}

export function SignupError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="flex w-full items-start gap-1.5 text-[0.8125rem] leading-[1.45] text-down" role="alert">
      <CircleAlert aria-hidden="true" className="mt-[0.15em] size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  )
}

export function ReceiptLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="shrink-0 text-ink-quiet">{label}</dt>
      <span
        aria-hidden="true"
        className="h-px min-w-4 flex-1 translate-y-[-0.2em] border-b border-dotted border-line"
      />
      <dd className="flex min-w-0 items-center gap-1.5 text-ink">{children}</dd>
    </div>
  )
}
