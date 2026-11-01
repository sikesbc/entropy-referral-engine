import { WalletAvatar } from "@/components/ui/wallet-avatar"
import { shortAddress } from "@/lib/format/address"

export function TraderIdentity({ address, username }: { address: string; username: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3" title={address}>
      <WalletAvatar seed={address} size="1.75rem" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[0.875rem] text-ink">{username}</span>
        <span className="truncate font-mono text-[0.6875rem] text-ink-quiet">{shortAddress(address)}</span>
      </span>
    </span>
  )
}
