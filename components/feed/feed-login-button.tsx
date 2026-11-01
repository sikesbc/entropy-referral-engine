"use client"

import { useLoginModal } from "@/components/auth/login-modal-context"

export function FeedLoginButton() {
  const { openLogin } = useLoginModal()
  return (
    <button
      type="button"
      onClick={() => openLogin()}
      className="rounded-[0.4375rem] bg-panel-2 px-3 py-2 text-[0.8125rem] font-medium text-ink transition-shadow enabled:hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.05)] disabled:opacity-40 dark:bg-panel-3 dark:enabled:hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.18)]"
    >
      Login
    </button>
  )
}
