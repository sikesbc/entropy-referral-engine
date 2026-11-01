"use client"

import { Search, WalletCards } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { WalletId } from "@/lib/auth/types"
import {
  PRIVY_BORDER,
  PRIVY_ICON_MUTED,
  PRIVY_MUTED_TEXT,
  PRIVY_TEXT,
  PRIVY_TITLE_CLASS,
} from "./privy-styles"
import { WalletOptionButton } from "./wallet-option-button"
import { WALLET_DIRECTORY_SIZE, WALLET_OPTIONS } from "./wallet-options"

export function WalletPickerView({
  pendingWallet,
  error,
  onSelect,
}: {
  pendingWallet: WalletId | null
  error: string | null
  onSelect: (wallet: WalletId) => void
}) {
  const [query, setQuery] = useState("")
  const needle = query.trim().toLowerCase()
  const wallets = needle
    ? WALLET_OPTIONS.filter((wallet) => wallet.name.toLowerCase().includes(needle))
    : WALLET_OPTIONS

  return (
    <div className="flex flex-col items-center">
      <span className={cn("mt-[12px] flex size-[32px] items-center justify-center", PRIVY_ICON_MUTED)}>
        <WalletCards size={32} strokeWidth={2} aria-hidden="true" />
      </span>
      <h3 id="privy-dialog-title" className={cn(PRIVY_TITLE_CLASS, "mt-[36px]")}>
        Select your wallet
      </h3>
      <div className="mt-[24px] w-full pr-[28px] pl-[24px]">
        <label className="relative block h-[56px] w-full">
          <span
            className={cn(
              "absolute top-1/2 left-[12px] flex size-[32px] -translate-y-1/2 items-center justify-center",
              PRIVY_ICON_MUTED,
            )}
          >
            <Search size={16} strokeWidth={2} aria-hidden="true" />
          </span>
          <input
            type="text"
            value={query}
            aria-label="Search wallets"
            placeholder={`Search through ${WALLET_DIRECTORY_SIZE} wallets`}
            onChange={(event) => setQuery(event.target.value)}
            className={cn(
              "block h-[56px] w-full rounded-[12px] border bg-transparent py-[12px] pr-[16px] pl-[52px] text-[14px] leading-[24px] outline-none placeholder:text-[#9ca3af] focus:border-black/[0.28] dark:focus:border-white/[0.24]",
              PRIVY_BORDER,
              PRIVY_TEXT,
            )}
          />
        </label>
      </div>
      <div className="relative mt-[8px] w-full pr-[28px] pl-[24px]">
        <div className="flex max-h-[285px] flex-col gap-[5px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {wallets.map((wallet) => (
            <WalletOptionButton
              key={wallet.id}
              wallet={wallet}
              pending={pendingWallet === wallet.id}
              disabled={pendingWallet !== null}
              onSelect={() => onSelect(wallet.id)}
            />
          ))}
          {wallets.length === 0 ? (
            <p className={cn("m-0 py-[16px] text-center text-[14px] leading-[20px]", PRIVY_MUTED_TEXT)}>
              No wallets found. Try another search.
            </p>
          ) : null}
        </div>
        <span className="pointer-events-none absolute right-0 bottom-0 left-0 h-[12px] bg-linear-to-b from-transparent to-black/[0.04] dark:to-white/[0.055]" />
      </div>
      {error ? (
        <p role="alert" className="m-0 mt-[8px] text-[13px] leading-[20px] text-[#ef4444]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
