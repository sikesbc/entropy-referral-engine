"use client"

import { X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  forgetIgnoredInvite,
  IGNORED_INVITE_PARAM,
  useInviteNotice,
} from "@/lib/referral-site/ignored-invite"

export function InviteIgnoredNote() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const notice = useInviteNotice()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !notice) return null

  const dismiss = () => {
    setDismissed(true)
    forgetIgnoredInvite()
    const next = new URLSearchParams(searchParams.toString())
    next.delete(IGNORED_INVITE_PARAM)
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-b border-line bg-panel-2 px-6 py-2.5 text-[0.8125rem] text-ink-soft sm:px-12"
    >
      <span>
        {notice.status === "own"
          ? "This is your link."
          : `You're already signed up, so ${notice.username ? `${notice.username}'s` : "that"} invite wasn't applied.`}
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-[0.375rem] text-ink-quiet transition-colors hover:bg-panel-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-soft"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  )
}
