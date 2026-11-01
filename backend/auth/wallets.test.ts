import { describe, expect, it } from "vitest"
import { chooseWallet, linkedEthereumWallets } from "./wallets"

const first = "0x1111111111111111111111111111111111111111"
const second = "0x2222222222222222222222222222222222222222"

describe("linkedEthereumWallets", () => {
  it("keeps only ethereum wallets, lowercased, most recently verified first", () => {
    const wallets = linkedEthereumWallets([
      {
        type: "wallet",
        chain_type: "ethereum",
        address: first.toUpperCase().replace("0X", "0x"),
        latest_verified_at: 10,
      },
      {
        type: "wallet",
        chain_type: "solana",
        address: "So11111111111111111111111111111111111111112",
        latest_verified_at: 99,
      },
      { type: "email", address: "a@b.c" },
      { type: "wallet", chain_type: "ethereum", address: second, latest_verified_at: 20 },
    ])
    expect(wallets).toEqual([second, first])
  })

  it("drops malformed addresses", () => {
    expect(linkedEthereumWallets([{ type: "wallet", chain_type: "ethereum", address: "0x12" }])).toEqual([])
  })
})

describe("chooseWallet", () => {
  it("honors the requested wallet when it is linked", () => {
    expect(chooseWallet([first, second], second.toUpperCase().replace("0X", "0x"))).toBe(second)
  })

  it("falls back to the first linked wallet when the request is not linked", () => {
    expect(chooseWallet([first, second], "0x3333333333333333333333333333333333333333")).toBe(first)
  })

  it("returns null when nothing is linked", () => {
    expect(chooseWallet([], first)).toBeNull()
  })
})
