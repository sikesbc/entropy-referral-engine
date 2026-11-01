import { BadgeCheck } from "lucide-react"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import type { LeaderboardEntry } from "./leaderboard-entries"
import { XLogo } from "./x-logo"

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <tr className="border-b border-line/50 last:border-b-0">
      <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-ink-quiet">{entry.rank}</td>
      <td className="min-w-0 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <WalletAvatar seed={entry.handle} src={entry.avatarUrl} size={28} className="shrink-0" />
          <span className="truncate text-[13px] font-medium text-ink">{entry.handle}</span>
          {entry.xUsername ? (
            <a
              href={`https://x.com/${encodeURIComponent(entry.xUsername)}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`View @${entry.xUsername} on X`}
              className="shrink-0 text-ink transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--entropy-orange)]"
            >
              <XLogo className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {entry.xUsername ? (
            <span
              aria-label="Verified"
              role="img"
              title="Verified"
              className="shrink-0 text-[var(--entropy-orange)]"
            >
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
        </span>
      </td>
    </tr>
  )
}
