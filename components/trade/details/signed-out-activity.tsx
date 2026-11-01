"use client"

import { useLoginModal } from "@/components/auth/login-modal-context"
import { SECONDARY_BUTTON } from "./activity-cells"

export function SignedOutActivity() {
  const { openLogin } = useLoginModal()
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <p className="text-[0.8125rem] text-ink-quiet">Your trades will appear here.</p>
      <button type="button" className={SECONDARY_BUTTON} onClick={() => openLogin()}>
        Login
      </button>
    </div>
  )
}
