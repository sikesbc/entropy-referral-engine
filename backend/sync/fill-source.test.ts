import { describe, expect, it } from "vitest"
import type { HyperliquidFill } from "@/backend/hyperliquid/info"
import { HISTORY_CAP, PAGE_SIZE, collectFills } from "./fill-source"

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

function pagedSource(all: HyperliquidFill[]) {
  const starts: number[] = []
  const fetchPage = async (start: number) => {
    starts.push(start)
    return all.filter((item) => item.time >= start).slice(0, PAGE_SIZE)
  }
  return { fetchPage, starts }
}

describe("collectFills", () => {
  it("stops after a short page", async () => {
    const { fetchPage, starts } = pagedSource([fill(1, 10), fill(2, 20)])
    const result = await collectFills(fetchPage, 0)
    expect(result.fills.map((item) => item.tid)).toEqual([1, 2])
    expect(result.possibleGap).toBe(false)
    expect(starts).toEqual([0])
  })

  it("pages from the last fill time and dedupes the overlap", async () => {
    const all = Array.from({ length: PAGE_SIZE + PAGE_SIZE / 4 }, (_, index) => fill(index + 1, index + 1))
    const { fetchPage, starts } = pagedSource(all)
    const result = await collectFills(fetchPage, 0)
    expect(result.fills).toHaveLength(all.length)
    expect(starts).toEqual([0, PAGE_SIZE])
    expect(result.possibleGap).toBe(false)
  })

  it("flags a possible gap at the history cap", async () => {
    const all = Array.from({ length: HISTORY_CAP }, (_, index) => fill(index + 1, index + 1))
    const { fetchPage } = pagedSource(all)
    const result = await collectFills(fetchPage, 0)
    expect(result.possibleGap).toBe(true)
  })

  it("stops and flags a gap when a full page cannot advance", async () => {
    const all = Array.from({ length: PAGE_SIZE }, (_, index) => fill(index + 1, 5))
    const { fetchPage } = pagedSource(all)
    const result = await collectFills(fetchPage, 5)
    expect(result.possibleGap).toBe(true)
    expect(result.fills).toHaveLength(PAGE_SIZE)
  })
})
