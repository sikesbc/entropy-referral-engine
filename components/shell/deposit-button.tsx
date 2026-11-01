"use client"

import { useDepositModal } from "@/components/deposit/deposit-modal-context"
import { useGeoStatus } from "@/lib/api/account"

export const GEO_RESTRICTED_DEPOSIT_MESSAGE = "Deposits are unavailable in your current region."

export function DepositButton({ onDeposit }: { onDeposit?: () => void }) {
  const restricted = Boolean(useGeoStatus().data?.restricted)
  const { openDeposit } = useDepositModal()
  return (
    <button
      type="button"
      data-tour="deposit"
      disabled={restricted}
      title={restricted ? GEO_RESTRICTED_DEPOSIT_MESSAGE : undefined}
      onClick={onDeposit ?? openDeposit}
      className="lite-raised-orange inline-flex h-7 items-center justify-center whitespace-nowrap rounded-[0.4375rem] px-3 text-[0.8125rem] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Deposit
    </button>
  )
}
