import { WalletAvatar } from "@/components/ui/wallet-avatar"
import { identityHandle } from "@/lib/feed/format"
import type { FeedTrader } from "@/lib/feed/trade-event"

export function PopularLeaderRow({
  rank,
  trader,
  subscriberCount,
  countLabel,
  onSelect,
}: {
  rank: number
  trader: FeedTrader
  subscriberCount: number
  countLabel: [singular: string, plural: string]
  onSelect: (trader: FeedTrader) => void
}) {
  return (
    <li className="border-t border-line-soft first:border-t-0">
      <button
        type="button"
        onClick={() => onSelect(trader)}
        className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-[0.5rem] px-2 py-2.5 text-left transition-colors hover:bg-ink/4 dark:hover:bg-ink/8"
      >
        <span className="w-4 shrink-0 font-mono text-[0.75rem] tabular-nums text-ink-quiet">{rank}</span>
        <WalletAvatar
          seed={trader.address}
          src={trader.avatarUrl}
          size="2rem"
          className="shrink-0 rounded-full"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[0.875rem] font-medium text-ink">{trader.name}</span>
          <span className="truncate text-[0.75rem] text-ink-quiet">{identityHandle(trader)}</span>
        </span>
        {subscriberCount > 0 ? (
          <span className="shrink-0 text-[0.75rem] text-ink-quiet">
            <span className="font-mono text-[0.8125rem] tabular-nums text-ink">{subscriberCount}</span>{" "}
            {countLabel[subscriberCount === 1 ? 0 : 1]}
          </span>
        ) : null}
      </button>
    </li>
  )
}
