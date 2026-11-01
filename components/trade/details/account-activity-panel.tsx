"use client"

import { ActivityMessage } from "./activity-message"
import type { DetailTab } from "./detail-tabs"
import { HistoryTable } from "./history-table"
import { useMarketDirectory } from "./market-directory"
import { OrdersTable } from "./orders-table"
import { PositionsTable } from "./positions-table"
import { useAccountActivity } from "./use-account-activity"

type ActivityTab = Exclude<DetailTab, "about">

export function AccountActivityPanel({ tab, dex }: { tab: ActivityTab; dex: string }) {
  const activity = useAccountActivity(dex)
  const markets = useMarketDirectory()

  if (activity.error) return <ActivityMessage spacing="py-10">Could not load activity.</ActivityMessage>
  if (activity.loading) return <ActivityMessage spacing="py-10">Loading activity…</ActivityMessage>

  if (tab === "positions") {
    return activity.positions.length > 0 ? (
      <PositionsTable positions={activity.positions} markets={markets} />
    ) : (
      <ActivityMessage>No open positions.</ActivityMessage>
    )
  }

  if (tab === "orders") {
    return (
      <div className="overflow-x-auto">
        {activity.orders.length > 0 ? (
          <OrdersTable orders={activity.orders} markets={markets} />
        ) : (
          <ActivityMessage>No pending orders.</ActivityMessage>
        )}
      </div>
    )
  }

  return activity.history.length > 0 ? (
    <HistoryTable trades={activity.history} markets={markets} />
  ) : (
    <ActivityMessage>Nothing closed yet. Positions you close move here, with how they went.</ActivityMessage>
  )
}
