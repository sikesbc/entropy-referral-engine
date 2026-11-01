import { describe, expect, it } from "vitest"
import { WalletError, walletErrorKind, walletErrorMessage, type WalletErrorKind } from "./wallet-errors"

describe("walletErrorKind", () => {
  it("separates closed, popup, network, wallet and unknown failures", () => {
    expect(walletErrorKind("exited_auth_flow")).toBe("closed")
    expect(walletErrorKind({ code: 4001, message: "User rejected the request." })).toBe("closed")
    expect(walletErrorKind(new Error("Popup was blocked"))).toBe("popup_blocked")
    expect(walletErrorKind(new TypeError("Failed to fetch"))).toBe("network")
    expect(walletErrorKind("client_request_timeout")).toBe("network")
    expect(walletErrorKind(new WalletError("no_wallet"))).toBe("no_wallet")
    expect(walletErrorKind("unknown_auth_error")).toBe("unknown")
    const kinds: WalletErrorKind[] = [
      "closed",
      "popup_blocked",
      "network",
      "no_wallet",
      "session_ended",
      "unknown",
    ]
    for (const kind of kinds) expect(walletErrorMessage(kind)).not.toMatch(/[-–—]|^No /)
  })
})
