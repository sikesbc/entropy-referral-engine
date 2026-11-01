import { describe, expect, it } from "vitest"
import { exclusive, orderSyncJobs, runSyncJobs, type JobOutcome, type PlannedJob } from "./plan"

const job = (
  address: string,
  referrer: string | null = null,
  lastSyncedAt: number | null = null,
): PlannedJob => ({
  address,
  referrer,
  lastSyncedAt,
})

const ok: JobOutcome = { fillsInserted: 1, earningsInserted: 1, possibleGap: false }

function harness(failing: string[] = [], budget = Infinity) {
  const ran: string[] = []
  const failed: string[] = []
  return {
    ran,
    failed,
    deps: {
      run: async (planned: PlannedJob) => {
        ran.push(planned.address)
        if (failing.includes(planned.address)) throw new Error("boom")
        return ok
      },
      onFailure: async (planned: PlannedJob) => {
        failed.push(planned.address)
      },
      pause: async () => undefined,
      outOfTime: () => ran.length >= budget,
    },
  }
}

describe("orderSyncJobs", () => {
  it("syncs referrers before their referees at any depth", () => {
    const ordered = orderSyncJobs([job("c", "b"), job("b", "a"), job("a")])
    expect(ordered.map((planned) => planned.address)).toEqual(["a", "b", "c"])
  })

  it("puts never-synced then least recently synced wallets first within a depth", () => {
    const ordered = orderSyncJobs([job("x", null, 300), job("y", null, 100), job("z", null, null)])
    expect(ordered.map((planned) => planned.address)).toEqual(["z", "y", "x"])
  })
})

describe("runSyncJobs", () => {
  it("defers referees, transitively, when their referrer failed this run", async () => {
    const { ran, failed, deps } = harness(["a"])
    const counts = await runSyncJobs([job("a"), job("b", "a"), job("c", "b"), job("d")], deps)
    expect(ran).toEqual(["a", "d"])
    expect(failed).toEqual(["a"])
    expect(counts).toMatchObject({ wallets: 4, failed: 1, deferred: 2, fillsInserted: 1 })
  })

  it("still syncs referees whose referrer succeeded", async () => {
    const { ran, deps } = harness()
    const counts = await runSyncJobs([job("a"), job("b", "a")], deps)
    expect(ran).toEqual(["a", "b"])
    expect(counts).toMatchObject({ failed: 0, deferred: 0, earningsInserted: 2 })
  })

  it("stops starting jobs once out of time and counts the rest as deferred", async () => {
    const { ran, deps } = harness([], 1)
    const counts = await runSyncJobs([job("a"), job("b"), job("c")], deps)
    expect(ran).toEqual(["a"])
    expect(counts.deferred).toBe(2)
  })
})

describe("exclusive", () => {
  it("skips the work when the lock is held elsewhere", async () => {
    let ran = false
    const outcome = await exclusive(
      async () => false,
      async () => {
        ran = true
      },
    )
    expect(outcome).toEqual({ status: "busy" })
    expect(ran).toBe(false)
  })

  it("runs the work when the lock is acquired", async () => {
    expect(
      await exclusive(
        async () => true,
        async () => 7,
      ),
    ).toEqual({ status: "ran", value: 7 })
  })
})
