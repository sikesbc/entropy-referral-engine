"use client"

import { useState } from "react"
import { useAccount, useGeoStatus } from "@/lib/api/account"
import { useProfileAccount, useProfileFills, useProfileHistory } from "@/lib/api/profile"
import { useSession } from "@/lib/auth/auth-context"
import type { PortfolioRange } from "@/lib/profile/portfolio-history"
import { formatJoined } from "@/lib/profile/username"
import { useNow } from "@/lib/runtime/runtime-context"
import { AccountActions } from "./account-actions"
import { AccountCard } from "./account-card"
import { PortfolioValueCard } from "./portfolio-value-card"
import { ProfileIdentity } from "./profile-identity"
import { CARD_CLASS, PROFILE_MAIN_CLASS } from "./profile-styles"
import { SignedInActivity } from "./signed-in-activity"

export function SignedInProfile({
  onDeposit,
  onWithdraw,
}: {
  onDeposit?: () => void
  onWithdraw?: () => void
}) {
  const { user } = useSession()
  const address = user?.walletAddress ?? ""
  const now = useNow(60_000)
  const [range, setRange] = useState<PortfolioRange>("1d")
  const [renamed, setRenamed] = useState<string | null>(null)

  const account = useProfileAccount(address)
  const history = useProfileHistory(address)
  const fills = useProfileFills(address, now)
  const me = useAccount().data?.account
  const depositRestricted = Boolean(useGeoStatus().data?.restricted)

  const activityUnavailable = fills.isError || fills.isLoading
  const unrealizedPnl = activityUnavailable
    ? null
    : account.positions.reduce((sum, position) => sum + position.unrealizedPnl, 0)

  return (
    <main
      className={`${PROFILE_MAIN_CLASS} md:grid md:grid-cols-[minmax(0,1fr)_22.5rem] md:grid-rows-[minmax(22rem,auto)_auto]`}
    >
      <section
        className={`${CARD_CLASS} flex min-w-0 scroll-mt-3 flex-col overflow-hidden h-[33rem] md:h-auto`}
      >
        <PortfolioValueCard
          equity={account.equity}
          equityError={account.equityError}
          onEquityRetry={account.retryEquity}
          portfolio={history.portfolio}
          historyLoading={history.isPending}
          historyError={history.isError}
          onHistoryRetry={history.retry}
          range={range}
          onRangeChange={setRange}
          now={now}
        />
      </section>
      <div className={`${CARD_CLASS} min-w-0`}>
        <AccountCard
          identity={
            <ProfileIdentity
              address={address || null}
              avatarSeed={user?.privyUserId ?? null}
              avatarUrl={me?.avatarUrl ?? user?.avatarUrl ?? null}
              username={renamed ?? me?.username ?? user?.username ?? null}
              joined={formatJoined(me?.createdAt)}
              onUsernameSubmit={setRenamed}
            />
          }
          cash={account.cash}
          inPositions={account.marginUsed}
          unrealizedPnl={unrealizedPnl}
          closedPnlLast30Days={history.monthChange}
          actions={
            <AccountActions
              depositRestricted={depositRestricted}
              canWithdraw={account.canWithdraw}
              onDeposit={onDeposit}
              onWithdraw={onWithdraw}
            />
          }
        />
      </div>
      <div className="flex min-w-0 flex-col md:col-span-2">
        <SignedInActivity
          positions={account.positions}
          closed={fills.closed}
          pending={fills.isLoading}
          historyError={fills.isError}
          onRetry={fills.retry}
        />
      </div>
    </main>
  )
}
