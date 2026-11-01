import { Unlink } from "lucide-react"
import { firstRunDelay } from "@/components/onboarding/first-run-delay"

export function InvalidInvite() {
  return (
    <p
      role="status"
      className="first-run-item flex items-start gap-2 text-[0.8125rem] leading-[1.45] text-ink-soft"
      style={firstRunDelay(0)}
    >
      <Unlink aria-hidden="true" className="mt-[0.15em] size-3.5 shrink-0 text-down" />
      This invite link isn’t valid. You can still sign up without one.
    </p>
  )
}
