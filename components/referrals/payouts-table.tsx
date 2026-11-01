"use client"

import { useState } from "react"
import type { ReferralPayout, ReferralPayoutStatus } from "@/lib/api/types/referrals"
import { cn } from "@/lib/utils"
import { PayoutTransaction } from "./payout-transaction"
import { EMPTY_VALUE, formatEarned, formatShortDate } from "./referral-format"
import {
  TABLE_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_HEADER_CELL_CLASS,
  TABLE_NUMBER_CELL_CLASS,
  TABLE_PAGER_CLASS,
  TABLE_ROW_CLASS,
} from "./referral-styles"
import { TablePager } from "@/components/ui/table-pager"

const STATUS_LABELS: Record<ReferralPayoutStatus, string> = {
  pending: "Pending",
  confirmed: "Paid",
  canceled: "Canceled",
  failed: "Failed",
}

const STATUS_TONES: Record<ReferralPayoutStatus, string> = {
  pending: "text-ink-soft",
  confirmed: "text-up",
  canceled: "text-ink-soft",
  failed: "text-down",
}

export function PayoutsTable({ payouts, pageSize }: { payouts: ReferralPayout[] | null; pageSize: number }) {
  const [page, setPage] = useState(0)

  if (!payouts?.length) {
    return (
      <div className="py-12 text-center text-[0.8125rem] text-ink-quiet">
        {payouts ? "No payouts yet." : "Loading payouts…"}
      </div>
    )
  }

  const pageCount = Math.ceil(payouts.length / pageSize)
  const current = Math.min(page, pageCount - 1)
  const rows = payouts.slice(current * pageSize, (current + 1) * pageSize)

  return (
    <>
      <div className="overflow-x-auto">
        <table className={TABLE_CLASS}>
          <thead className={TABLE_HEAD_CLASS}>
            <tr>
              <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "pl-0")}>
                Date
              </th>
              <th scope="col" className={TABLE_HEADER_CELL_CLASS}>
                Status
              </th>
              <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "hidden sm:table-cell")}>
                Transaction
              </th>
              <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "pr-0 text-right")}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((payout) => (
              <tr key={payout.id} className={TABLE_ROW_CLASS}>
                <td className="py-3 pl-0 pr-2 text-ink-soft">
                  {formatShortDate(payout.confirmedAt || payout.createdAt)}
                </td>
                <td className={cn("px-2 py-3", STATUS_TONES[payout.status])}>
                  {STATUS_LABELS[payout.status]}
                </td>
                <td className="hidden px-2 py-3 text-ink-soft sm:table-cell">
                  {payout.payoutTxHash ? (
                    <PayoutTransaction hash={payout.payoutTxHash} chainId={payout.chainId} />
                  ) : (
                    EMPTY_VALUE
                  )}
                </td>
                <td className={cn(TABLE_NUMBER_CELL_CLASS, "pr-0 text-ink")}>
                  {formatEarned(payout.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePager
        pager={{
          page: current,
          pageCount,
          from: current * pageSize + 1,
          to: current * pageSize + rows.length,
          total: payouts.length,
        }}
        onPageChange={setPage}
        className={TABLE_PAGER_CLASS}
      />
    </>
  )
}
