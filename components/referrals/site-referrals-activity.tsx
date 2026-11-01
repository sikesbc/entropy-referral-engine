"use client"

import { useState } from "react"
import { TablePager } from "@/components/ui/table-pager"
import { UnderlineTabs } from "@/components/ui/underline-tabs"
import type { ReferralsResponse } from "@/lib/referral-site/types"
import { useNow } from "@/lib/runtime/runtime-context"
import { CARD_CLASS, SMALL_BUTTON_CLASS, TABLE_PAGER_CLASS } from "./referral-styles"
import { SiteRecentTradesTable } from "./site-recent-trades-table"
import {
  SiteReferredTradersTable,
  sortTraders,
  type TraderSortKey,
  type TraderSortState,
} from "./site-referred-traders-table"

const PAGE_SIZE = 10

type ActivityTab = "referrals" | "activity"

function pageOf<T>(items: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const rows = items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)
  return {
    rows,
    pager: {
      page: current,
      pageCount,
      from: rows.length ? current * PAGE_SIZE + 1 : 0,
      to: current * PAGE_SIZE + rows.length,
      total: items.length,
    },
  }
}

function EmptyState({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-[0.8125rem] text-ink-quiet">
      {text}
      {onRetry ? (
        <button type="button" className={SMALL_BUTTON_CLASS} onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}

export function SiteReferralsActivity({
  referrals,
  isError,
  onRetry,
}: {
  referrals: ReferralsResponse | undefined
  isError: boolean
  onRetry: () => void
}) {
  const now = useNow(60_000)
  const [tab, setTab] = useState<ActivityTab>("referrals")
  const [sort, setSort] = useState<TraderSortState>({ key: "joined", desc: true })
  const [page, setPage] = useState(0)

  const traders = pageOf(referrals ? sortTraders(referrals.referrals, sort) : [], page)
  const trades = pageOf(referrals?.recentTrades ?? [], page)
  const pager = tab === "referrals" ? traders.pager : trades.pager
  const isEmpty = (tab === "referrals" ? traders.rows : trades.rows).length === 0

  const changeTab = (next: ActivityTab) => {
    setTab(next)
    setPage(0)
  }

  const changeSort = (key: TraderSortKey) => {
    setPage(0)
    setSort((current) => (current.key === key ? { key, desc: !current.desc } : { key, desc: true }))
  }

  return (
    <section
      aria-label="Your referrals"
      className={`${CARD_CLASS} flex min-h-[13.75rem] flex-1 flex-col px-6 pb-3`}
    >
      <UnderlineTabs
        tabs={[
          { value: "referrals", label: "Your referrals", count: referrals?.totals.referredCount },
          { value: "activity", label: "Activity", count: referrals?.recentTrades.length || undefined },
        ]}
        value={tab}
        onChange={changeTab}
        className="overflow-x-auto [scrollbar-width:none]"
      />
      {!referrals ? (
        isError ? (
          <EmptyState text="Couldn’t load referrals." onRetry={onRetry} />
        ) : (
          <EmptyState text={tab === "referrals" ? "Loading referrals…" : "Loading activity…"} />
        )
      ) : isEmpty ? (
        <EmptyState
          text={
            tab === "referrals"
              ? "No one here yet. Share your link to get started."
              : "No trades from your referrals yet."
          }
        />
      ) : tab === "referrals" ? (
        <SiteReferredTradersTable traders={traders.rows} sort={sort} onSort={changeSort} />
      ) : (
        <SiteRecentTradesTable trades={trades.rows} now={now} />
      )}
      {referrals && !isEmpty ? (
        <TablePager pager={pager} onPageChange={setPage} className={TABLE_PAGER_CLASS} />
      ) : null}
    </section>
  )
}
