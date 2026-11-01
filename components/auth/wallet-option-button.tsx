import { cn } from "@/lib/utils"
import { PRIVY_ROW_BUTTON_CLASS } from "./privy-styles"
import type { WalletOption } from "./wallet-options"

export function WalletOptionButton({
  wallet,
  pending,
  disabled,
  onSelect,
}: {
  wallet: WalletOption
  pending: boolean
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        PRIVY_ROW_BUTTON_CLASS,
        "h-[56px] gap-[10px] px-[11px] font-medium disabled:cursor-default dark:hover:bg-transparent",
      )}
    >
      <span className="relative size-[32px] shrink-0">
        <img alt="" src={wallet.icon} className="block size-[32px] rounded-[6px] object-contain" />
        {wallet.installed ? (
          <span className="absolute -top-[3px] -right-[3px] size-[6px] rounded-full bg-[#88e3b5]" />
        ) : null}
      </span>
      <span className="truncate">{wallet.name}</span>
      {pending ? <span className="ml-auto text-[13px] font-normal text-[#9ca3af]">Connecting…</span> : null}
    </button>
  )
}
