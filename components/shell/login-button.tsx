"use client"

import { useLoginModal } from "@/components/auth/login-modal-context"

export function LoginButton() {
  const { openLogin } = useLoginModal()
  return (
    <button
      type="button"
      aria-label="Login"
      onClick={() => openLogin()}
      className="inline-flex h-7 items-center justify-center whitespace-nowrap rounded-[0.4375rem] bg-panel-2 px-3 text-[0.8125rem] font-medium text-ink dark:bg-panel-3"
    >
      Login
    </button>
  )
}
