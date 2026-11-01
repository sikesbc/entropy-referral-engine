import { ArrowLeft } from "lucide-react"
import { ONBOARDING_COPY } from "./onboarding-copy"

export function OnboardingBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="first-run-item absolute left-5 top-5 z-10 flex items-center gap-1.5 text-[13px] text-ink-quiet transition-colors hover:text-ink-soft"
    >
      <ArrowLeft width={14} height={14} strokeWidth={2} aria-hidden="true" />
      {ONBOARDING_COPY.back}
    </button>
  )
}
