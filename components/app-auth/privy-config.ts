import type { PrivyClientConfig } from "@privy-io/react-auth"

export const APP_PRIVY_CONFIG: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    walletChainType: "ethereum-only",
    logo: "/entropy-logo-white.svg",
  },
  loginMethods: ["email", "wallet"],
  embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
}
