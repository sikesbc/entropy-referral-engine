import type { ReactNode } from "react"
import { AccountRow } from "./account-row"
import { AccountValue } from "./account-value"

export function AccountCard({
  identity,
  cash,
  inPositions,
  unrealizedPnl,
  closedPnlLast30Days,
  actions,
}: {
  identity: ReactNode
  cash: number | null
  inPositions: number | null
  unrealizedPnl: number | null
  closedPnlLast30Days: number | null
  actions: ReactNode
}) {
  return (
    <aside aria-label="Account" className="flex h-full flex-col gap-3 px-[1.375rem] py-4">
      <div className="pb-4">{identity}</div>
      <div className="flex flex-col">
        <AccountRow label="Cash available">
          <AccountValue value={cash} />
        </AccountRow>
        <AccountRow label="In positions">
          <AccountValue value={inPositions} />
        </AccountRow>
        <AccountRow label="Unrealized P&L">
          <AccountValue value={unrealizedPnl} signed />
        </AccountRow>
        <AccountRow label="30D P&L">
          <AccountValue value={closedPnlLast30Days} signed />
        </AccountRow>
      </div>
      <div className="mt-auto grid auto-cols-fr grid-flow-col gap-2.5">{actions}</div>
    </aside>
  )
}
