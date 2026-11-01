import { describe, expect, it } from "vitest"
import type { HyperliquidFill } from "@/backend/hyperliquid/info"
import { collectTraded } from "./collect"
import type { FillSource } from "./fill-source"

function fill(tid: number, time: number): HyperliquidFill {
  return {
    coin: "io:OAI",
    px: "1",
    sz: "1",
    side: "B",
    time,
    hash: "0x",
    tid,
    fee: "0",
    feeToken: "USDC",
    crossed: true,
    dir: "Open Long",
  }
}

function source(byTrader: Record<string, HyperliquidFill[]>, subAccounts: string[] = []): FillSource {
  return {
    subAccounts: async () => subAccounts,
    fillsSince: async (address, startMs) => ({
      fills: (byTrader[address] ?? []).filter((item) => item.time >= startMs),
      possibleGap: false,
    }),
  }
}

describe("collectTraded", () => {
  it("moves the cursor one millisecond past the newest fill", async () => {
    const result = await collectTraded("0xa", 100, source({ "0xa": [fill(1, 150), fill(2, 200)] }))
    expect(result.cursorMs).toBe(201)
    expect(result.traded.map((item) => item.tid)).toEqual([1, 2])
  })

  it("does not refetch the last fill on the next run", async () => {
    const fills = source({ "0xa": [fill(1, 150), fill(2, 200)] })
    const first = await collectTraded("0xa", 100, fills)
    const second = await collectTraded("0xa", first.cursorMs, fills)
    expect(second.traded).toEqual([])
    expect(second.cursorMs).toBe(first.cursorMs)
  })

  it("keeps the cursor when nothing new arrived", async () => {
    const result = await collectTraded("0xa", 500, source({ "0xa": [fill(1, 150)] }))
    expect(result).toEqual({ traded: [], possibleGap: false, cursorMs: 500 })
  })

  it("advances past the newest fill across sub-accounts", async () => {
    const result = await collectTraded(
      "0xa",
      100,
      source({ "0xa": [fill(1, 150)], "0xb": [fill(2, 300)] }, ["0xb"]),
    )
    expect(result.cursorMs).toBe(301)
    expect(result.traded.map((item) => item.traderAddress)).toEqual(["0xa", "0xb"])
  })
})
