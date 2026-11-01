import { ONBOARDING_COPY } from "./onboarding-copy"

export function OnboardingProgress({ current, total }: { current: number; total: number }) {
  return (
    <div
      aria-label={ONBOARDING_COPY.stepLabel(current + 1, total)}
      aria-valuemax={total}
      aria-valuemin={1}
      aria-valuenow={current + 1}
      className="absolute right-5 top-7 z-10 flex items-center gap-1.5"
      role="progressbar"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-1 w-7 rounded-full transition-colors ${index <= current ? "bg-ink" : "bg-panel-3"}`}
        />
      ))}
    </div>
  )
}
