import { describe, expect, it } from "vitest"
import { chunk, groupByAddress, planDeliveries, weeklySummary, type PendingEvent } from "./batch"
import { DEFAULT_PREFS, INDIVIDUAL_LIMIT } from "./decide"

describe("chunk", () => {
  it("splits into groups of at most the given size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 100)).toEqual([])
  })
})

describe("planDeliveries", () => {
  const target = (address: string, eventKey: string) => ({ address, eventKey, payload: { username: "bob" } })

  it("skips addresses without an active subscription", () => {
    const planned = planDeliveries("joined", [target("0xa", "joined:1")], new Map())
    expect(planned[0].delivery).toBe("skipped")
  })

  it("sends the first three individually and batches the rest per address", () => {
    const subscriptions = new Map([["0xa", { prefs: DEFAULT_PREFS, sent: INDIVIDUAL_LIMIT - 1 }]])
    const planned = planDeliveries(
      "joined",
      [target("0xa", "joined:1"), target("0xa", "joined:2")],
      subscriptions,
    )
    expect(planned.map((event) => event.delivery)).toEqual(["immediate", "batched"])
  })

  it("batches everything for weekly-only subscribers", () => {
    const subscriptions = new Map([["0xa", { prefs: { ...DEFAULT_PREFS, weeklyOnly: true }, sent: 0 }]])
    const planned = planDeliveries("boost", [target("0xa", "boost:1")], subscriptions)
    expect(planned[0].delivery).toBe("batched")
  })

  it("sends every boost immediately regardless of prior sends", () => {
    const subscriptions = new Map([
      ["0xa", { prefs: DEFAULT_PREFS, sent: 10 }],
      ["0xb", { prefs: { ...DEFAULT_PREFS, boost: false }, sent: 0 }],
    ])
    const planned = planDeliveries(
      "boost",
      [target("0xa", "boost:1"), target("0xa", "boost:2"), target("0xb", "boost:1")],
      subscriptions,
    )
    expect(planned.map((event) => event.delivery)).toEqual(["immediate", "immediate", "skipped"])
  })
})

describe("weekly grouping", () => {
  const events: PendingEvent[] = [
    { address: "0xa", event_key: "joined:1", kind: "joined", payload: { username: "one" } },
    {
      address: "0xa",
      event_key: "first_trade:1",
      kind: "first_trade",
      payload: { username: "one", coin: "io:OAI" },
    },
    { address: "0xb", event_key: "boost:1", kind: "boost", payload: { coin: "io:OAI" } },
    { address: "0xa", event_key: "unlock:io:OAI", kind: "unlock", payload: { coin: "io:OAI" } },
  ]

  it("groups pending events by address keeping their order", () => {
    const groups = groupByAddress(events)
    expect(groups.get("0xa")?.map((event) => event.event_key)).toEqual([
      "joined:1",
      "first_trade:1",
      "unlock:io:OAI",
    ])
    expect(groups.get("0xb")).toHaveLength(1)
  })

  it("summarizes joins, first trades and other events", () => {
    expect(weeklySummary(groupByAddress(events).get("0xa") ?? [])).toEqual({
      joined: [{ username: "one" }],
      firstTrades: [{ username: "one", coin: "io:OAI" }],
      other: 1,
    })
  })
})
