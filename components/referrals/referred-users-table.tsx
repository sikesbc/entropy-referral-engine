import { WalletAvatar } from "@/components/ui/wallet-avatar"
import type { ReferredUser, ReferredUsersSort } from "@/lib/api/types/referrals"
import { cn } from "@/lib/utils"
import { EMPTY_VALUE, formatEarned, formatRate, formatShortDate, formatVolume } from "./referral-format"
import {
  TABLE_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_HEADER_CELL_CLASS,
  TABLE_NUMBER_CELL_CLASS,
  TABLE_ROW_CLASS,
} from "./referral-styles"
import { SortHeader } from "@/components/ui/sort-header"

export type ReferredUsersSortState = { key: ReferredUsersSort; desc: boolean }

const DEFAULT_TRADER_NAME = "Trader"

export function ReferredUsersTable({
  users,
  sort,
  onSort,
  commissionRate,
}: {
  users: ReferredUser[]
  sort: ReferredUsersSortState
  onSort: (key: ReferredUsersSort) => void
  commissionRate: number | null
}) {
  const header = (key: ReferredUsersSort, label: string, className: string) => (
    <SortHeader
      label={label}
      isActive={sort.key === key}
      isDescending={sort.desc}
      onSort={() => onSort(key)}
      isRightAligned={key !== "joined"}
      className={className}
    />
  )

  return (
    <div className="overflow-x-auto">
      <table className={TABLE_CLASS}>
        <thead className={TABLE_HEAD_CLASS}>
          <tr>
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "pl-0")}>
              Trader
            </th>
            {header("joined", "Joined", "hidden sm:table-cell")}
            {header("volume", "Volume", "text-right")}
            {header("lifetime", "You earned", "text-right")}
            <th scope="col" className={cn(TABLE_HEADER_CELL_CLASS, "hidden pr-0 text-right sm:table-cell")}>
              Your share
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={TABLE_ROW_CLASS}>
              <td className="max-w-[18rem] py-3 pl-0 pr-2">
                <span className="flex min-w-0 items-center gap-3">
                  <WalletAvatar
                    seed={user.id}
                    src={user.avatarUrl}
                    size="2.25rem"
                    className="shrink-0 rounded-full"
                  />
                  <span className="truncate font-sans text-[0.9375rem] font-semibold text-ink">
                    {user.username || DEFAULT_TRADER_NAME}
                  </span>
                </span>
              </td>
              <td className="hidden px-2 py-3 text-ink-soft sm:table-cell">
                {formatShortDate(user.joinedAt)}
              </td>
              <td className={cn(TABLE_NUMBER_CELL_CLASS, "text-ink")}>{formatVolume(user.volumeUsd)}</td>
              <td
                className={cn(
                  TABLE_NUMBER_CELL_CLASS,
                  user.lifetimeCommission > 0 ? "text-up" : "text-ink-soft",
                )}
              >
                {formatEarned(user.lifetimeCommission)}
              </td>
              <td className={cn(TABLE_NUMBER_CELL_CLASS, "hidden pr-0 text-ink-soft sm:table-cell")}>
                {commissionRate === null ? EMPTY_VALUE : formatRate(commissionRate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
