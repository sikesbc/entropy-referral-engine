"use client"

import { useMemo } from "react"
import { AsideSectionHeading } from "./aside-section-heading"
import { PopularLeaderRow } from "./popular-leader-row"
import { SkeletonList } from "./skeleton-list"
import { useWalletIdentityMap } from "@/lib/api/social"
import type { PopularLeader } from "@/lib/api/types/discovery"
import type { FeedTrader } from "@/lib/feed/trade-event"

const LOADING_ROWS = 3

export function PopularLeadersSection({
  title,
  leaders,
  isLoading,
  countLabel,
  onSelectTrader,
}: {
  title: string
  leaders: PopularLeader[] | null
  isLoading: boolean
  countLabel: [singular: string, plural: string]
  onSelectTrader: (trader: FeedTrader) => void
}) {
  const addresses = useMemo(
    () => (leaders ?? []).map((leader) => leader.leaderAddress.toLowerCase()),
    [leaders],
  )
  const { traderFor } = useWalletIdentityMap(addresses)
  if (!isLoading && !leaders?.length) return null
  return (
    <section className="flex flex-col gap-1">
      <AsideSectionHeading title={title} />
      {leaders ? (
        <ul className="flex flex-col">
          {leaders.map((leader, index) => (
            <PopularLeaderRow
              key={leader.leaderAddress}
              rank={index + 1}
              trader={traderFor(leader.leaderAddress)}
              subscriberCount={leader.subscriberCount}
              countLabel={countLabel}
              onSelect={onSelectTrader}
            />
          ))}
        </ul>
      ) : (
        <SkeletonList
          label="Loading traders"
          count={LOADING_ROWS}
          className="gap-2"
          itemClassName="h-11 rounded-[0.5rem]"
        />
      )}
    </section>
  )
}
