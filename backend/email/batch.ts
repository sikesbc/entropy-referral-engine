import { decideDelivery, type Delivery, type EmailKind, type EmailPrefs } from "./decide"
import type { EventPayload, WeeklyPayload } from "./render"

export type NotifyTarget = { address: string; eventKey: string; payload: EventPayload }

export type PlannedEvent = NotifyTarget & { delivery: Delivery }

export type PendingEvent = { address: string; event_key: string; kind: string; payload: EventPayload }

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size))
  return chunks
}

export function planDeliveries(
  kind: EmailKind,
  targets: readonly NotifyTarget[],
  subscriptions: ReadonlyMap<string, { prefs: EmailPrefs; sent: number }>,
): PlannedEvent[] {
  const sent = new Map<string, number>()
  return targets.map((target) => {
    const subscription = subscriptions.get(target.address)
    const sentIndividually = sent.get(target.address) ?? subscription?.sent ?? 0
    const delivery = decideDelivery({ kind, prefs: subscription?.prefs ?? null, sentIndividually })
    if (delivery === "immediate") sent.set(target.address, sentIndividually + 1)
    return { ...target, delivery }
  })
}

export function groupByAddress(events: readonly PendingEvent[]): Map<string, PendingEvent[]> {
  const groups = new Map<string, PendingEvent[]>()
  for (const event of events) {
    const group = groups.get(event.address)
    if (group) group.push(event)
    else groups.set(event.address, [event])
  }
  return groups
}

export function weeklySummary(pending: readonly PendingEvent[]): WeeklyPayload {
  return {
    joined: pending.filter((event) => event.kind === "joined").map((event) => event.payload),
    firstTrades: pending.filter((event) => event.kind === "first_trade").map((event) => event.payload),
    other: pending.filter((event) => event.kind === "unlock" || event.kind === "boost").length,
  }
}
