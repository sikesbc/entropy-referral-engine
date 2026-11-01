"use client"

import { useState } from "react"
import { useReferredUsers } from "@/lib/api/referrals"
import type { ReferralPayout, ReferredUsersParams, ReferredUsersSort } from "@/lib/api/types/referrals"
import { PayoutsTable } from "./payouts-table"
import { CARD_CLASS, SMALL_BUTTON_CLASS, TABLE_PAGER_CLASS } from "./referral-styles"
import { ReferredUsersTable, type ReferredUsersSortState } from "./referred-users-table"
import { TablePager } from "@/components/ui/table-pager"
import { UnderlineTabs } from "@/components/ui/underline-tabs"

const PAGE_SIZE = 10

type ActivityTab = "referrals" | "payouts"

export function ReferralsActivity({
  referredCount,
  commissionRate,
  payouts,
}: {
  referredCount: number | null
  commissionRate: number | null
  payouts: ReferralPayout[] | null
}) {
  const [tab, setTab] = useState<ActivityTab>("referrals")
  const [sort, setSort] = useState<ReferredUsersSortState>({ key: "joined", desc: true })
  const [page, setPage] = useState(1)

  const params: ReferredUsersParams = {
    page,
    pageSize: PAGE_SIZE,
    scope: "network",
    depth: 1,
    sortBy: sort.key,
    sortOrder: sort.desc ? "desc" : "asc",
  }
  const query = useReferredUsers(params, { enabled: tab === "referrals" })
  const result = query.data?.data
  const users = result?.items ?? []

  const changeSort = (key: ReferredUsersSort) => {
    setPage(1)
    setSort((current) => (current.key === key ? { key, desc: !current.desc } : { key, desc: true }))
  }

  const changeTab = (next: ActivityTab) => {
    setTab(next)
    setPage(1)
  }

  return (
    <section
      aria-label="Your referrals"
      className={`${CARD_CLASS} flex min-h-[13.75rem] flex-1 flex-col px-6 pb-3`}
    >
      <UnderlineTabs
        tabs={[
          { value: "referrals", label: "Your referrals", count: referredCount ?? undefined },
          { value: "payouts", label: "Payouts", count: payouts?.length || undefined },
        ]}
        value={tab}
        onChange={changeTab}
        className="overflow-x-auto [scrollbar-width:none]"
      />
      {tab === "payouts" ? (
        <PayoutsTable payouts={payouts} pageSize={PAGE_SIZE} />
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-[0.8125rem] text-ink-quiet">
          {query.isPending
            ? "Loading referrals…"
            : query.isError
              ? "Couldn’t load referrals."
              : "No one here yet. Share your link to get started."}
          {query.isError ? (
            <button type="button" className={SMALL_BUTTON_CLASS} onClick={() => void query.refetch()}>
              Try again
            </button>
          ) : null}
        </div>
      ) : (
        <ReferredUsersTable users={users} sort={sort} onSort={changeSort} commissionRate={commissionRate} />
      )}
      {tab === "referrals" && result ? (
        <TablePager
          pager={{
            page: result.page - 1,
            pageCount: result.totalPages,
            from: users.length ? (result.page - 1) * PAGE_SIZE + 1 : 0,
            to: (result.page - 1) * PAGE_SIZE + users.length,
            total: result.totalItems,
          }}
          onPageChange={(next) => setPage(next + 1)}
          className={TABLE_PAGER_CLASS}
        />
      ) : null}
    </section>
  )
}
