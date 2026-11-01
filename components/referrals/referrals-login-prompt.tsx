"use client"

import { useLoginModal } from "@/components/auth/login-modal-context"
import { CARD_CLASS, LOGIN_BUTTON_CLASS, MAIN_CLASS } from "./referral-styles"

export function ReferralsLoginPrompt() {
  const { openLogin } = useLoginModal()
  return (
    <main className={MAIN_CLASS}>
      <section className={`${CARD_CLASS} p-5`}>
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-xl">Referrals</h1>
          <p className="text-[0.8125rem] text-ink-quiet">
            Log in to get your referral code and see what you’ve earned.
          </p>
          <button type="button" className={LOGIN_BUTTON_CLASS} onClick={() => openLogin()}>
            Login
          </button>
        </div>
      </section>
    </main>
  )
}
