"use client"

import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmailLoginField } from "./email-login-field"
import { PRIVY_ICON_MUTED, PRIVY_ROW_BUTTON_CLASS, PRIVY_TITLE_CLASS } from "./privy-styles"

export function LoginLandingView({
  defaultEmail,
  submitting,
  error,
  onSubmitEmail,
  onChooseWallet,
}: {
  defaultEmail: string
  submitting: boolean
  error: string | null
  onSubmitEmail: (email: string) => void
  onChooseWallet: () => void
}) {
  return (
    <div className="flex flex-col items-center">
      <img
        alt="Entropy logo"
        src="/entropy-logo-white.svg"
        className="block h-[90px] w-auto max-w-[180px] invert dark:invert-0"
      />
      <h3 id="privy-dialog-title" className={cn(PRIVY_TITLE_CLASS, "mt-[16px]")}>
        Log in or sign up
      </h3>
      <div className="mt-[26px] flex w-full flex-col gap-[8px] px-[27px]">
        <EmailLoginField defaultEmail={defaultEmail} submitting={submitting} onSubmit={onSubmitEmail} />
        {error ? (
          <p role="alert" className="m-0 text-left text-[13px] leading-[20px] text-[#ef4444]">
            {error}
          </p>
        ) : null}
        <button type="button" onClick={onChooseWallet} className={cn(PRIVY_ROW_BUTTON_CLASS, "gap-[12px]")}>
          <span
            className={cn(
              "flex size-[32px] shrink-0 items-center justify-center rounded-[4px]",
              PRIVY_ICON_MUTED,
            )}
          >
            <Wallet size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          Continue with a wallet
        </button>
      </div>
    </div>
  )
}
