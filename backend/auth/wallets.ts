import "server-only"
import { normalizeAddress } from "@/backend/referrals/address"

export type LinkedAccountLike = {
  type: string
  address?: string
  chain_type?: string
  latest_verified_at?: number | null
}

export function linkedEthereumWallets(accounts: readonly LinkedAccountLike[]): string[] {
  return accounts
    .filter((account) => account.type === "wallet" && account.chain_type === "ethereum")
    .sort((a, b) => (b.latest_verified_at ?? 0) - (a.latest_verified_at ?? 0))
    .flatMap((account) => {
      const address = normalizeAddress(account.address ?? "")
      return address ? [address] : []
    })
}

export function chooseWallet(wallets: readonly string[], requested: string | null): string | null {
  const wanted = requested === null ? null : normalizeAddress(requested)
  if (wanted !== null && wallets.includes(wanted)) return wanted
  return wallets[0] ?? null
}
