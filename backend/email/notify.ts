import "server-only"
import { db } from "@/backend/db/client"
import {
  chunk,
  groupByAddress,
  planDeliveries,
  weeklySummary,
  type NotifyTarget,
  type PendingEvent,
} from "./batch"
import { boostEventKey, pendingBoosts, type ActiveBoost } from "./boosts"
import { isoWeek, type EmailKind, type EmailPrefs } from "./decide"
import { renderEvent, renderWeekly, unsubscribeUrl, type EventPayload, type Recipient } from "./render"
import { sendEmails, type Outgoing } from "./send"
import { unsubscribeToken } from "./token"

type Subscription = { email: string; prefs: EmailPrefs; recipient: Recipient; sent: number }

type SubscriptionRow = {
  address: string
  email: string
  joined: boolean
  first_trade: boolean
  unlock: boolean
  boost: boolean
  weekly_only: boolean
  code: string | null
  sent: number
}

const JOIN_LOOKBACK = "7 days"
const INSERT_CHUNK = 1000

async function loadSubscriptions(
  sentKind: EmailKind | null,
  addresses: readonly string[] | null,
): Promise<Map<string, Subscription>> {
  const sql = db()
  if (addresses !== null && addresses.length === 0) return new Map()
  const rows = await sql<SubscriptionRow[]>`
    select s.address, s.email, s.joined, s.first_trade, s.unlock, s.boost, s.weekly_only, rc.code,
      ${
        sentKind === null
          ? sql`0`
          : sql`(select count(*)::int from email_events e
              where e.address = s.address and e.kind = ${sentKind} and e.delivery = 'immediate')`
      } as sent
    from email_subscriptions s
    left join referral_codes rc on rc.address = s.address and rc.is_current
    where s.unsubscribed_at is null
      ${addresses === null ? sql`` : sql`and s.address in ${sql([...new Set(addresses)])}`}
  `
  return new Map(
    rows.map((row) => [
      row.address,
      {
        email: row.email,
        prefs: {
          joined: row.joined,
          firstTrade: row.first_trade,
          unlock: row.unlock,
          boost: row.boost,
          weeklyOnly: row.weekly_only,
        },
        recipient: { code: row.code, unsubscribeUrl: unsubscribeUrl(unsubscribeToken(row.address)) },
        sent: row.sent,
      },
    ]),
  )
}

async function guarded(label: string, run: () => Promise<unknown>): Promise<void> {
  try {
    await run()
  } catch (error) {
    console.error(`[email] ${label} failed`, error)
  }
}

type EventRow = {
  address: string
  event_key: string
  kind: string
  delivery: string
  payload: EventPayload | { events: number }
}

async function claimEvents(rows: EventRow[]): Promise<Set<string>> {
  const sql = db()
  const claimed = new Set<string>()
  for (const rowChunk of chunk(rows, INSERT_CHUNK)) {
    const values = rowChunk.map((row) => ({ ...row, payload: sql.json(row.payload) }))
    const inserted = await sql<{ address: string; event_key: string }[]>`
      insert into email_events ${sql(values, "address", "event_key", "kind", "delivery", "payload")}
      on conflict (address, event_key) do nothing
      returning address, event_key
    `
    for (const row of inserted) claimed.add(`${row.address}\n${row.event_key}`)
  }
  return claimed
}

async function notifyMany(
  kind: EmailKind,
  targets: NotifyTarget[],
  subscriptions?: Map<string, Subscription>,
): Promise<void> {
  if (targets.length === 0) return
  const subs =
    subscriptions ??
    (await loadSubscriptions(
      kind,
      targets.map((target) => target.address),
    ))
  const planned = planDeliveries(kind, targets, subs)
  const claimed = await claimEvents(
    planned.map((event) => ({
      address: event.address,
      event_key: event.eventKey,
      kind,
      delivery: event.delivery,
      payload: event.payload,
    })),
  )
  const messages: Outgoing[] = planned.flatMap((event) => {
    const subscription = subs.get(event.address)
    if (
      !claimed.has(`${event.address}\n${event.eventKey}`) ||
      event.delivery !== "immediate" ||
      !subscription
    )
      return []
    return [
      {
        address: event.address,
        to: subscription.email,
        kind,
        email: renderEvent(kind, event.payload, subscription.recipient),
        unsubscribeUrl: subscription.recipient.unsubscribeUrl,
      },
    ]
  })
  await sendEmails(messages)
}

async function notify(
  address: string,
  kind: EmailKind,
  eventKey: string,
  payload: EventPayload,
): Promise<void> {
  await notifyMany(kind, [{ address, eventKey, payload }])
}

async function notifyJoined(referee: string, referrer: string, username: string): Promise<void> {
  await notify(referrer, "joined", `joined:${referee}`, { username })
}

export async function notifyRefereeActivity(
  referee: string,
  referrer: string,
  fillsInserted: number,
): Promise<void> {
  await guarded("referee activity", async () => {
    const [row] = await db()<
      { username: string; recent: boolean; fills: number; coin: string | null; earned: string | null }[]
    >`
      select u.username,
        exists (
          select 1 from attributions a where a.referee = u.address and a.attributed_at > now() - ${JOIN_LOOKBACK}::interval
        ) as recent,
        (select count(*)::int from fills f where f.address = u.address) as fills,
        first.coin, first.earned
      from users u
      left join lateral (
        select f.coin, e.referrer_earned::text as earned
        from fills f left join earnings e on e.referee = f.address and e.tid = f.tid
        where f.address = u.address order by f.time, f.tid limit 1
      ) first on true
      where u.address = ${referee}
    `
    if (!row) return
    if (row.recent) await notifyJoined(referee, referrer, row.username)
    if (fillsInserted === 0 || row.fills !== fillsInserted || !row.coin) return
    await notify(referrer, "first_trade", `first_trade:${referee}`, {
      username: row.username,
      coin: row.coin,
      earnedUsd: row.earned ?? "0",
    })
  })
}

export async function notifyUnlocks(address: string, coins: string[]): Promise<void> {
  await guarded("unlock", () =>
    notifyMany(
      "unlock",
      coins.map((coin) => ({ address, eventKey: `unlock:${coin}`, payload: { coin } })),
    ),
  )
}

export async function notifyPendingEvents(): Promise<void> {
  await guarded("joins", async () => {
    const joins = await db()<{ referee: string; referrer: string; username: string }[]>`
      select a.referee, a.referrer, u.username
      from attributions a join users u on u.address = a.referee
      where a.attributed_at > now() - ${JOIN_LOOKBACK}::interval
        and not exists (
          select 1 from email_events e where e.address = a.referrer and e.event_key = 'joined:' || a.referee
        )
    `
    await notifyMany(
      "joined",
      joins.map((join) => ({
        address: join.referrer,
        eventKey: `joined:${join.referee}`,
        payload: { username: join.username },
      })),
    )
  })
  await guarded("boosts", notifyNewBoosts)
}

async function notifyNewBoosts(): Promise<void> {
  const sql = db()
  const active = await sql<ActiveBoost[]>`
    select coin, boost_rate::text as rate, boost_until as until from market_programs where boost_until > now()
  `
  if (active.length === 0) return
  const keys = active.map((boost) => boostEventKey(boost.coin, boost.until))
  const notified = await sql<{ event_key: string }[]>`
    select distinct event_key from email_events where kind = 'boost' and event_key in ${sql(keys)}
  `
  const pending = pendingBoosts(active, new Set(notified.map((row) => row.event_key)))
  if (pending.length === 0) return
  const subscriptions = await loadSubscriptions("boost", null)
  const targets = pending.flatMap((boost) => {
    const eventKey = boostEventKey(boost.coin, boost.until)
    const payload = { coin: boost.coin, rate: boost.rate, until: boost.until.toISOString() }
    return [...subscriptions.keys()].map((address) => ({ address, eventKey, payload }))
  })
  await notifyMany("boost", targets, subscriptions)
}

export async function sendWeeklySummaries(now = new Date()): Promise<{ sent: number; skipped: number }> {
  const sql = db()
  const week = isoWeek(now)
  const [subscriptions, pendingRows] = await Promise.all([
    loadSubscriptions(null, null),
    sql<PendingEvent[]>`
      select e.address, e.event_key, e.kind, e.payload
      from email_events e
      join email_subscriptions s on s.address = e.address and s.unsubscribed_at is null
      where e.delivery = 'batched' and e.summarized_at is null
      order by e.address, e.created_at
    `,
  ])
  const pendingByAddress = groupByAddress(pendingRows)
  const due = [...subscriptions].flatMap(([address, subscription]) => {
    const pending = pendingByAddress.get(address)
    return pending ? [{ address, subscription, pending }] : []
  })
  const claimed = await claimEvents(
    due.map(({ address, pending }) => ({
      address,
      event_key: `weekly:${week}`,
      kind: "weekly",
      delivery: "immediate",
      payload: { events: pending.length },
    })),
  )
  const sending = due.filter(({ address }) => claimed.has(`${address}\nweekly:${week}`))
  const summarized = sending.flatMap(({ pending }) =>
    pending.map((event) => ({ address: event.address, event_key: event.event_key })),
  )
  for (const pairs of chunk(summarized, INSERT_CHUNK)) {
    await sql`
      update email_events e set summarized_at = now()
      from (values ${sql(pairs, "address", "event_key")}) as v (address, event_key)
      where e.address = v.address and e.event_key = v.event_key
    `
  }
  await sendEmails(
    sending.map(({ address, subscription, pending }) => ({
      address,
      to: subscription.email,
      kind: "weekly",
      email: renderWeekly(weeklySummary(pending), subscription.recipient),
      unsubscribeUrl: subscription.recipient.unsubscribeUrl,
    })),
  )
  return { sent: sending.length, skipped: subscriptions.size - sending.length }
}
