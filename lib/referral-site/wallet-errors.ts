export type WalletErrorKind =
  "closed" | "popup_blocked" | "network" | "no_wallet" | "session_ended" | "unknown"

export class WalletError extends Error {
  constructor(readonly kind: WalletErrorKind) {
    super(walletErrorMessage(kind))
  }
}

const CLOSED_CODES = new Set(["exited_auth_flow", "exited_link_flow", "oauth_user_denied", "user_rejected"])
const NETWORK_CODES = new Set(["client_request_timeout", "too_many_requests"])
const USER_REJECTED_RPC = 4001

const MESSAGES: Record<WalletErrorKind, string> = {
  closed: "You closed the wallet window. Try again when you're ready.",
  popup_blocked: "Your browser blocked the wallet window. Allow popups for this site and try again.",
  network: "We couldn't reach the wallet service. Check your connection and try again.",
  no_wallet: "You signed in without a wallet. Sign out and connect a wallet.",
  session_ended: "Your session ended. Connect your wallet again.",
  unknown: "Your wallet hit a problem. Try again.",
}

export function walletErrorMessage(kind: WalletErrorKind): string {
  return MESSAGES[kind]
}

function textOf(error: unknown): string {
  if (typeof error === "string") return error
  if (error instanceof Error) return `${error.name} ${error.message}`
  return ""
}

export function walletErrorKind(error: unknown): WalletErrorKind {
  if (error instanceof WalletError) return error.kind
  if (typeof error === "object" && error !== null && "code" in error && error.code === USER_REJECTED_RPC)
    return "closed"
  const text = textOf(error).toLowerCase()
  if (CLOSED_CODES.has(text) || /user (rejected|denied|closed)/.test(text)) return "closed"
  if (text.includes("popup")) return "popup_blocked"
  if (NETWORK_CODES.has(text) || /network|failed to fetch|timeout|timed out|offline/.test(text))
    return "network"
  return "unknown"
}
