"use client"

import { X } from "lucide-react"
import { Dialog, DialogClose, DialogDescription, DialogPortal, DialogTitle } from "@/components/ui/dialog"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { useSession } from "@/lib/auth/auth-context"
import { DepositAddressField } from "./deposit-address-field"

const DEPOSIT_ASSET = "USDC"
const DEPOSIT_NETWORK = "Arbitrum"
const MINIMUM_DEPOSIT = 5

export function DepositModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user } = useSession()
  const address = user?.walletAddress ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Popup
          aria-label="Deposit"
          className="entropy-trade-scope fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-1.5rem)] max-w-[22rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[0.625rem] border border-line-soft bg-panel p-4 text-ink shadow-[var(--shadow)] outline-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-[1rem] font-medium leading-tight text-ink">Deposit</DialogTitle>
              <DialogDescription className="text-[0.75rem] leading-[1.4] text-ink-quiet">
                Send {DEPOSIT_ASSET} on {DEPOSIT_NETWORK} to your Entropy account. Funds arrive in about a
                minute.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-[0.375rem] text-ink-quiet transition-colors hover:bg-panel-2 hover:text-ink dark:hover:bg-panel-3"
            >
              <X size="0.875rem" aria-hidden="true" />
            </DialogClose>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-[0.75rem]">
            <div className="flex flex-col gap-0.5 rounded-[0.5rem] bg-panel-2 px-3 py-2 dark:bg-panel-3">
              <dt className="text-ink-quiet">Asset</dt>
              <dd className="font-medium text-ink">{DEPOSIT_ASSET}</dd>
            </div>
            <div className="flex flex-col gap-0.5 rounded-[0.5rem] bg-panel-2 px-3 py-2 dark:bg-panel-3">
              <dt className="text-ink-quiet">Network</dt>
              <dd className="font-medium text-ink">{DEPOSIT_NETWORK}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] text-ink-quiet">Your deposit address</span>
            {address ? (
              <DepositAddressField address={address} />
            ) : (
              <span className="text-[0.75rem] text-ink-soft">Sign in to see your deposit address.</span>
            )}
          </div>
          <p className="text-[0.6875rem] leading-[1.4] text-ink-quiet">
            Minimum deposit {MINIMUM_DEPOSIT} {DEPOSIT_ASSET}. Sending any other asset or network may result
            in loss of funds.
          </p>
          <DialogClose className="lite-raised-orange inline-flex h-8 items-center justify-center rounded-[0.4375rem] text-[0.8125rem]">
            Done
          </DialogClose>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
