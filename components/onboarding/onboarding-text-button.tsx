import type { ReactNode } from "react"

export const TEXT_BUTTON_CLASS = "text-[13px] text-ink-quiet transition-colors hover:text-ink-soft"

export function OnboardingTextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={TEXT_BUTTON_CLASS}>
      {children}
    </button>
  )
}
