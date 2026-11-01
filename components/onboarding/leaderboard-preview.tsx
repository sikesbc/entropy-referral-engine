"use client"

import { useTopTraders } from "@/lib/api/discovery"
import { firstRunDelay } from "./first-run-delay"
import { leaderboardEntries } from "./leaderboard-entries"
import { LeaderboardRow } from "./leaderboard-row"
import { ONBOARDING_COPY, ONBOARDING_LEADERBOARD } from "./onboarding-copy"

const { size, ...params } = ONBOARDING_LEADERBOARD

export function LeaderboardPreview() {
  const query = useTopTraders(params)
  const entries = leaderboardEntries(query.data?.traders ?? [], size)
  const emptyMessage = query.isError
    ? ONBOARDING_COPY.leaderboardError
    : query.isPending
      ? ONBOARDING_COPY.leaderboardLoading
      : ONBOARDING_COPY.leaderboardEmpty

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="first-run-item flex flex-col gap-1.5" style={firstRunDelay(0)}>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">
          {ONBOARDING_COPY.leaderboardTitle}
        </h1>
        <p className="text-[14px] text-ink-soft">{ONBOARDING_COPY.leaderboardSubtitle}</p>
      </div>
      <section
        aria-label={ONBOARDING_COPY.leaderboardLabel}
        aria-busy={query.isPending || query.isFetching}
        className="first-run-item overflow-hidden rounded-[12px] border border-line bg-panel-2"
        style={firstRunDelay(60)}
      >
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-12" />
            <col />
          </colgroup>
          <thead className="border-b border-line/70 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-quiet">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium" scope="col">
                {ONBOARDING_COPY.leaderboardRank}
              </th>
              <th className="py-2.5 text-left font-medium" scope="col">
                {ONBOARDING_COPY.leaderboardTrader}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <LeaderboardRow key={`${entry.rank}:${entry.handle}`} entry={entry} />
            ))}
            {entries.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-[12px] text-ink-soft" colSpan={2}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
      <aside className="first-run-item flex flex-col gap-3" style={firstRunDelay(120)}>
        <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-ink-soft">
          {ONBOARDING_COPY.leaderboardPitch}
        </p>
      </aside>
    </div>
  )
}
