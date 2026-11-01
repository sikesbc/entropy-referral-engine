"use client"

import { useLoginModal } from "@/components/auth/login-modal-context"
import { CARD_CLASS, SECONDARY_BUTTON_CLASS } from "./profile-styles"

export function SignedOutPortfolioCard() {
  const { openLogin } = useLoginModal()
  return (
    <section className={`${CARD_CLASS} p-5`}>
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-xl">Your portfolio</h1>
        <p className="text-[0.8125rem] text-ink-quiet">
          Log in to see your portfolio, positions and trade history.
        </p>
        <button className={SECONDARY_BUTTON_CLASS} onClick={() => openLogin()}>
          Login
        </button>
      </div>
    </section>
  )
}
