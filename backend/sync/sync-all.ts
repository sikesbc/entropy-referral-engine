import "server-only"
import { randomUUID } from "node:crypto"
import { db } from "@/backend/db/client"
import { notifyPendingEvents } from "@/backend/email/notify"
import { collectTraded } from "./collect"
import { ingestFills, ingestOwnFills } from "./ingest"
import { liveFillSource, type FillSource } from "./fill-source"
import {
  exclusive,
  orderSyncJobs,
  runSyncJobs,
  type JobOutcome,
  type PlannedJob,
  type RunCounts,
} from "./plan"
import { recordUnlocks } from "./unlocks"

export type SyncCounts = RunCounts

export type SyncResult = ({ status: "ran" } & SyncCounts) | { status: "busy" }

type SyncJob = PlannedJob & { startMs: number; run: () => Promise<JobOutcome> }

type Referee = {
  address: string
  referrer: string
  attributed_at: Date
  cursor_ms: number | null
  last_synced_at: Date | null
  is_referrer: boolean
}

type Referrer = {
  address: string
  created_at: Date
  cursor_ms: number | null
  last_synced_at: Date | null
}

const WALLET_DELAY_MS = 250
const RUN_BUDGET_MS = 240_000
const SYNC_LOCK_KEY = "entropy:sync-all"
const LEASE_SECONDS = 300

function pause(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function errorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500)
}

async function loadReferees(): Promise<Referee[]> {
  return db()<Referee[]>`
    select u.address, a.referrer, a.attributed_at, s.cursor_ms, s.last_synced_at,
      exists (select 1 from referral_codes c where c.address = u.address) as is_referrer
    from users u
    join attributions a on a.referee = u.address
    left join sync_state s on s.address = u.address
    where not u.simulated
    order by u.address
  `
}

async function loadReferrers(): Promise<Referrer[]> {
  return db()<Referrer[]>`
    select u.address, u.created_at, s.cursor_ms, s.last_synced_at
    from users u
    left join sync_state s on s.address = u.address
    where not u.simulated
      and exists (select 1 from referral_codes c where c.address = u.address)
      and not exists (select 1 from attributions a where a.referee = u.address)
    order by u.address
  `
}

async function saveCursor(address: string, cursorMs: number, possibleGap: boolean) {
  await db()`
    insert into sync_state (address, cursor_ms, last_synced_at, gap_suspected, last_error)
    values (${address}, ${cursorMs}, now(), ${possibleGap}, null)
    on conflict (address) do update set
      cursor_ms = excluded.cursor_ms,
      last_synced_at = excluded.last_synced_at,
      gap_suspected = sync_state.gap_suspected or excluded.gap_suspected,
      last_error = null
  `
}

async function syncReferee(referee: Referee, source: FillSource) {
  const attributedAt = referee.attributed_at.getTime()
  const { traded, possibleGap, cursorMs } = await collectTraded(
    referee.address,
    referee.cursor_ms ?? attributedAt,
    source,
  )
  const ingested = await ingestFills(referee.address, referee.referrer, attributedAt, traded, "hyperliquid")
  await saveCursor(referee.address, cursorMs, possibleGap)
  if (referee.is_referrer && ingested.fillsInserted > 0) await recordUnlocks(referee.address)
  return { ...ingested, possibleGap }
}

async function syncReferrer(referrer: Referrer, source: FillSource) {
  const { traded, possibleGap, cursorMs } = await collectTraded(
    referrer.address,
    referrer.cursor_ms ?? referrer.created_at.getTime(),
    source,
  )
  const fillsInserted = await ingestOwnFills(referrer.address, traded, "hyperliquid")
  await saveCursor(referrer.address, cursorMs, possibleGap)
  if (fillsInserted > 0) await recordUnlocks(referrer.address)
  return { fillsInserted, earningsInserted: 0, possibleGap }
}

async function recordFailure(address: string, startMs: number, error: unknown) {
  await db()`
    insert into sync_state (address, cursor_ms, last_error)
    values (${address}, ${startMs}, ${errorMessage(error)})
    on conflict (address) do update set last_error = excluded.last_error
  `
}

async function runSync(source: FillSource): Promise<SyncCounts> {
  const startedAt = Date.now()
  const referrers = await loadReferrers()
  const referees = await loadReferees()
  const jobs: SyncJob[] = [
    ...referrers.map((referrer) => ({
      address: referrer.address,
      referrer: null,
      lastSyncedAt: referrer.last_synced_at?.getTime() ?? null,
      startMs: referrer.cursor_ms ?? referrer.created_at.getTime(),
      run: () => syncReferrer(referrer, source),
    })),
    ...referees.map((referee) => ({
      address: referee.address,
      referrer: referee.referrer,
      lastSyncedAt: referee.last_synced_at?.getTime() ?? null,
      startMs: referee.cursor_ms ?? referee.attributed_at.getTime(),
      run: () => syncReferee(referee, source),
    })),
  ]

  const counts = await runSyncJobs(orderSyncJobs(jobs), {
    run: (job) => job.run(),
    onFailure: (job, error) => recordFailure(job.address, job.startMs, error),
    pause: () => pause(WALLET_DELAY_MS),
    outOfTime: () => Date.now() - startedAt > RUN_BUDGET_MS,
  })

  await notifyPendingEvents()
  return counts
}

async function acquireLease(holder: string): Promise<boolean> {
  const rows = await db()<{ holder: string }[]>`
    insert into sync_lease (name, holder, expires_at)
    values (${SYNC_LOCK_KEY}, ${holder}, now() + make_interval(secs => ${LEASE_SECONDS}))
    on conflict (name) do update set holder = excluded.holder, expires_at = excluded.expires_at
    where sync_lease.expires_at < now()
    returning holder
  `
  return rows.length === 1
}

async function releaseLease(holder: string): Promise<void> {
  await db()`update sync_lease set expires_at = now() where name = ${SYNC_LOCK_KEY} and holder = ${holder}`
}

export async function syncAll(source: FillSource = liveFillSource()): Promise<SyncResult> {
  const holder = randomUUID()
  const outcome = await exclusive(
    () => acquireLease(holder),
    async () => {
      try {
        return await runSync(source)
      } finally {
        await releaseLease(holder)
      }
    },
  )
  return outcome.status === "ran" ? { status: "ran", ...outcome.value } : { status: "busy" }
}
