"use client"

import type { CSSProperties } from "react"
import { GEO_RESTRICTED_DEPOSIT_MESSAGE } from "@/components/shell/deposit-button"
import { ACTION_BUTTON_CLASS } from "./profile-styles"

export function AccountActions({
  depositRestricted,
  canWithdraw,
  onDeposit,
  onWithdraw,
}: {
  depositRestricted: boolean
  canWithdraw: boolean
  onDeposit?: () => void
  onWithdraw?: () => void
}) {
  return (
    <>
      <div
        className="liquid-metal-button h-14 shrink-0 rounded-[1rem] bg-black/10 dark:bg-white/[0.16]"
        data-disabled={depositRestricted ? "true" : undefined}
        style={{ "--liquid-metal-ring-width": "1.5px" } as CSSProperties}
      >
        <button
          type="button"
          disabled={depositRestricted}
          title={depositRestricted ? GEO_RESTRICTED_DEPOSIT_MESSAGE : undefined}
          onClick={onDeposit}
          className="block h-full w-full rounded-[calc(1rem-1.5px)] bg-panel-2 font-sans text-[1.0625rem] font-medium leading-[1.375rem] tracking-[-0.018em] text-ink transition-transform duration-150 enabled:active:scale-[0.98] disabled:text-ink-quiet dark:bg-panel-3"
        >
          Deposit
        </button>
      </div>
      <button type="button" onClick={onWithdraw} disabled={!canWithdraw} className={ACTION_BUTTON_CLASS}>
        Withdraw
      </button>
    </>
  )
}
