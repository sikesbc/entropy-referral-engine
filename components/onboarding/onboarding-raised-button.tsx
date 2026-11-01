import type { ComponentProps } from "react"

export const RAISED_BUTTON_CLASS =
  "relative z-10 flex w-full items-center justify-center rounded-[7.5px] bg-panel-3 px-4 py-3 text-[14px] font-medium text-ink disabled:cursor-not-allowed disabled:text-ink-quiet"

export const RAISED_BUTTON_FRAME_CLASS = "w-full rounded-[9px] bg-panel-3 p-[2.5px]"

export function OnboardingRaisedButton({
  className = RAISED_BUTTON_CLASS,
  ...props
}: ComponentProps<"button">) {
  return (
    <div className={RAISED_BUTTON_FRAME_CLASS}>
      <button className={className} {...props} />
    </div>
  )
}
