import { DiscoverNavHeading } from "./discover-nav-heading"
import { DiscoverNavItem } from "./discover-nav-item"
import {
  FEED_SEGMENTS,
  FEED_VIEWS,
  LEADERBOARD_SEGMENTS,
  LEADERBOARD_VIEWS,
  type SocialView,
} from "@/lib/feed/views"

export function DiscoverNav({ view, onChange }: { view: SocialView; onChange: (view: SocialView) => void }) {
  return (
    <nav
      aria-label="Discover"
      className="entropy-card rounded-[0.625rem] flex gap-1 overflow-x-auto p-2 [scrollbar-width:none] lg:min-h-0 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:p-2.5"
    >
      <DiscoverNavHeading text="LEADERBOARD" />
      {LEADERBOARD_SEGMENTS.map((segment) => (
        <DiscoverNavItem
          key={segment}
          title={LEADERBOARD_VIEWS[segment].title}
          isActive={view.kind === "leaderboard" && view.segment === segment}
          onClick={() => onChange({ kind: "leaderboard", segment })}
        />
      ))}
      <DiscoverNavHeading text="FEED" className="pt-5" />
      {FEED_SEGMENTS.map((segment) => (
        <DiscoverNavItem
          key={segment}
          title={FEED_VIEWS[segment].title}
          isActive={view.kind === "feed" && view.segment === segment}
          onClick={() => onChange({ kind: "feed", segment })}
        />
      ))}
    </nav>
  )
}
