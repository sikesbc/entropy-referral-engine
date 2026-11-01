export type PlannedJob = { address: string; referrer: string | null; lastSyncedAt: number | null }

export type JobOutcome = { fillsInserted: number; earningsInserted: number; possibleGap: boolean }

export type RunCounts = {
  wallets: number
  failed: number
  deferred: number
  gapSuspected: number
  fillsInserted: number
  earningsInserted: number
}

export type RunDeps<T> = {
  run: (job: T) => Promise<JobOutcome>
  onFailure: (job: T, error: unknown) => Promise<void>
  pause: () => Promise<void>
  outOfTime: () => boolean
}

export function orderSyncJobs<T extends PlannedJob>(jobs: T[]): T[] {
  const referrerOf = new Map<string, string>()
  for (const job of jobs) if (job.referrer !== null) referrerOf.set(job.address, job.referrer)
  const depth = (address: string): number => {
    const seen = new Set<string>()
    let current = referrerOf.get(address)
    let hops = 0
    while (current !== undefined && !seen.has(current)) {
      seen.add(current)
      hops += 1
      current = referrerOf.get(current)
    }
    return hops
  }
  const staleness = (job: T) => job.lastSyncedAt ?? Number.NEGATIVE_INFINITY
  return [...jobs].sort(
    (a, b) =>
      depth(a.address) - depth(b.address) ||
      staleness(a) - staleness(b) ||
      a.address.localeCompare(b.address),
  )
}

export async function runSyncJobs<T extends PlannedJob>(jobs: T[], deps: RunDeps<T>): Promise<RunCounts> {
  const counts: RunCounts = {
    wallets: jobs.length,
    failed: 0,
    deferred: 0,
    gapSuspected: 0,
    fillsInserted: 0,
    earningsInserted: 0,
  }
  const blocked = new Set<string>()
  let started = 0
  for (const [index, job] of jobs.entries()) {
    if (deps.outOfTime()) {
      counts.deferred += jobs.length - index
      break
    }
    if (job.referrer !== null && blocked.has(job.referrer)) {
      blocked.add(job.address)
      counts.deferred += 1
      continue
    }
    if (started > 0) await deps.pause()
    started += 1
    try {
      const result = await deps.run(job)
      counts.fillsInserted += result.fillsInserted
      counts.earningsInserted += result.earningsInserted
      if (result.possibleGap) counts.gapSuspected += 1
    } catch (error) {
      counts.failed += 1
      blocked.add(job.address)
      await deps.onFailure(job, error).catch(() => undefined)
    }
  }
  return counts
}

export async function exclusive<T>(
  tryLock: () => Promise<boolean>,
  work: () => Promise<T>,
): Promise<{ status: "ran"; value: T } | { status: "busy" }> {
  if (!(await tryLock())) return { status: "busy" }
  return { status: "ran", value: await work() }
}
