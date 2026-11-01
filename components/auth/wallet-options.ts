import type { WalletId } from "@/lib/auth/types"

export type WalletOption = {
  id: WalletId
  name: string
  icon: string
  installed?: boolean
}

export const WALLET_DIRECTORY_SIZE = 598

export const WALLET_OPTIONS: WalletOption[] = [
  { id: "metamask", name: "MetaMask", icon: "/wallets/metamask.svg" },
  { id: "okx", name: "OKX Wallet", icon: "/wallets/okx.webp" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "/wallets/coinbase.svg", installed: true },
  { id: "rainbow", name: "Rainbow", icon: "/wallets/rainbow.webp" },
  { id: "phantom", name: "Phantom", icon: "/wallets/phantom.webp" },
]
