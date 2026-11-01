"use client"

import { useState } from "react"
import type { OpenPosition } from "@/lib/api/profile"
import type { ClosedPosition } from "@/lib/profile/closed-positions"
import { ActivityTabIcon, ACTIVITY_TAB_LABELS, type ActivityTabValue } from "./activity-tab-icons"
import { ActivityTabs, type ActivityTab } from "./activity-tabs"
import { HistoryTable } from "./history-table"
import { PositionsTable } from "./positions-table"
import { CARD_CLASS, EMPTY_TEXT_CLASS, SECONDARY_BUTTON_CLASS } from "./profile-styles"

export function SignedInActivity({
  positions,
  closed,
  pending,
  historyError,
  onRetry,
}: {
  positions: OpenPosition[]
  closed: ClosedPosition[]
  pending: boolean
  historyError: boolean
  onRetry: () => void
}) {
  const [tab, setTab] = useState<ActivityTabValue>("positions")
  const counts: Record<ActivityTabValue, number> = {
    positions: positions.length,
    orders: 0,
    history: closed.length,
  }
  const tabs: ActivityTab<ActivityTabValue>[] = (["positions", "orders", "history"] as const).map(
    (value) => ({
      value,
      label: ACTIVITY_TAB_LABELS[value],
      icon: <ActivityTabIcon tab={value} />,
      count: counts[value],
    }),
  )

  return (
    <section
      aria-label="Account activity"
      className={`${CARD_CLASS} flex min-h-[13.75rem] flex-1 flex-col px-6 pb-3`}
    >
      <ActivityTabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === "history" && historyError ? (
        <div className="py-10 text-center text-[0.8125rem] text-ink-quiet">
          Could not load activity.{" "}
          <button className={SECONDARY_BUTTON_CLASS} onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : pending && positions.length === 0 && closed.length === 0 ? (
        <p className="py-10 text-center text-[0.8125rem] text-ink-quiet">Loading activity…</p>
      ) : tab === "history" ? (
        closed.length ? (
          <HistoryTable closed={closed} />
        ) : (
          <p className={EMPTY_TEXT_CLASS}>
            Nothing closed yet. Positions you close move here, with how they went.
          </p>
        )
      ) : tab === "positions" ? (
        positions.length ? (
          <PositionsTable positions={positions} />
        ) : (
          <p className={EMPTY_TEXT_CLASS}>No open positions.</p>
        )
      ) : (
        <div className="overflow-x-auto">
          <p className={EMPTY_TEXT_CLASS}>No pending orders.</p>
        </div>
      )}
    </section>
  )
}
