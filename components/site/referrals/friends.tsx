"use client"

import Big from "big.js"
import { Check, ChevronLeft, ChevronRight, Hand, UserPlus } from "lucide-react"
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  EASE_OUT_EXPO,
  EXAMPLE_FEE_USD,
  EXAMPLE_TRADE_USD,
  INTRO_SENTENCES,
} from "@/components/referrals/intro/intro-copy"
import { FRIENDS_TOUR_TARGET } from "@/components/referrals/intro/intro-steps"
import { INTRO_STEP_EVENT, type IntroStepDetail } from "@/components/referrals/intro/intro-store"
import { prefersReducedMotion } from "@/components/referrals/intro/use-reduced-motion"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import { shortAddress } from "@/lib/format/address"
import { ENTROPY_SHARE, REFERRER_SHARE } from "@/lib/referral-site/config"
import {
  formatExactTimeUtc,
  formatExactUsd,
  formatRelativeTime,
  formatRoundedUsd,
  formatUsd,
} from "@/lib/referral-site/format"
import { NUDGE_MESSAGE } from "@/lib/referral-site/share"
import type { DecimalString, ReferredTrader } from "@/lib/referral-site/types"
import { cn } from "@/lib/utils"
import { useCopy } from "./use-copy"

const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 @lg:gap-x-6 @lg:grid-cols-[minmax(0,1fr)_9rem_8rem]"

const PAGE_SIZE = 8

export const OPEN_SHARE_EVENT = "entropy:open-share"

const SHOWCASE_HOLD_MS = 1700
const COLLAPSE_MS = 900

type ExampleFriend = { username: string; address: string; volumeUsd: DecimalString; earnedUsd: DecimalString }

const EARN_PER_DOLLAR = new Big(EXAMPLE_FEE_USD)
  .div(EXAMPLE_TRADE_USD)
  .times(ENTROPY_SHARE)
  .times(REFERRER_SHARE)

const EXAMPLE_FRIENDS: ExampleFriend[] = [
  ["Maya_Okafor", "0x7a3f9c2e81b04d56e9f1a2c3b4d5e6f708192a3b", "412900"],
  ["Calm_Ibis", "0x1c9e4b7a2d3f5e6081a2b3c4d5e6f7a8b9c0d1e2", "186400"],
  ["jun_trades", "0x5d2a8f1e3b4c6d7e8f9a0b1c2d3e4f5a6b7c8d9e", "92750"],
  ["Lark_Moreno", "0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b", "41300"],
  ["tomas_88", "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f", "10000"],
].map(([username, address, volumeUsd]) => ({
  username,
  address,
  volumeUsd,
  earnedUsd: new Big(volumeUsd).times(EARN_PER_DOLLAR).toFixed(),
}))

type SortKey = "earned" | "active" | "newest"

const SORTS: { key: SortKey; label: string }[] = [
  { key: "earned", label: "Earned" },
  { key: "active", label: "Active" },
  { key: "newest", label: "Newest" },
]

function byTradingFirst(a: ReferredTrader, b: ReferredTrader): number {
  const aTrading = a.firstTradeAt !== null
  const bTrading = b.firstTradeAt !== null
  return aTrading === bTrading ? 0 : aTrading ? -1 : 1
}

function byNewest(a: ReferredTrader, b: ReferredTrader): number {
  return Date.parse(b.joinedAt) - Date.parse(a.joinedAt)
}

function byLastTrade(a: ReferredTrader, b: ReferredTrader): number {
  if (a.lastTradeAt === b.lastTradeAt) return 0
  if (a.lastTradeAt === null) return 1
  if (b.lastTradeAt === null) return -1
  return Date.parse(b.lastTradeAt) - Date.parse(a.lastTradeAt)
}

function byEarned(a: ReferredTrader, b: ReferredTrader): number {
  return new Big(b.earnedUsd).cmp(a.earnedUsd) || new Big(b.volumeUsd).cmp(a.volumeUsd)
}

function sortFriends(traders: ReferredTrader[], key: SortKey): ReferredTrader[] {
  return [...traders].sort((a, b) => {
    if (key === "newest") return byNewest(a, b)
    if (key === "active") return byTradingFirst(a, b) || byLastTrade(a, b) || byEarned(a, b) || byNewest(a, b)
    return byTradingFirst(a, b) || byEarned(a, b) || byNewest(a, b)
  })
}

function SortTabs({ value, onChange }: { value: SortKey; onChange: (key: SortKey) => void }) {
  return (
    <div role="group" aria-label="Sort friends by" className="-mr-1.5 flex items-center">
      {SORTS.map(({ key, label }) => {
        const active = key === value
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(key)}
            className={cn(
              "h-7 rounded-md px-1.5 text-[0.75rem] underline-offset-[0.45em] outline-none transition-colors duration-150 ease-out focus-visible:bg-panel-3",
              active
                ? "text-ink underline decoration-ink-quiet decoration-1"
                : "text-ink-ghost hover:text-ink-soft",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded-full text-ink-soft outline-none transition-colors duration-150 ease-out hover:bg-panel-3 hover:text-ink focus-visible:bg-panel-3 disabled:pointer-events-none disabled:text-ink-ghost disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function Pager({
  page,
  pageCount,
  total,
  onChange,
}: {
  page: number
  pageCount: number
  total: number
  onChange: (page: number) => void
}) {
  const first = page * PAGE_SIZE + 1
  const last = Math.min(total, (page + 1) * PAGE_SIZE)
  return (
    <div className="flex items-center justify-between pt-3">
      <span aria-live="polite" className="font-mono text-[0.6875rem] tabular-nums text-ink-quiet">
        {first}–{last} of {total}
      </span>
      <span className="-mr-1.5 flex items-center gap-0.5">
        <PageButton label="Previous page" disabled={page === 0} onClick={() => onChange(page - 1)}>
          <ChevronLeft aria-hidden="true" className="size-4" />
        </PageButton>
        <PageButton label="Next page" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)}>
          <ChevronRight aria-hidden="true" className="size-4" />
        </PageButton>
      </span>
    </div>
  )
}

function Exact({ value }: { value: DecimalString }) {
  return (
    <span title={formatExactUsd(value)} className="font-mono text-[0.875rem] tabular-nums text-ink">
      {formatUsd(value)}
    </span>
  )
}

function Nudge({ username }: { username: string }) {
  const { copied, count, copy } = useCopy()
  return (
    <button
      type="button"
      onClick={() => copy(NUDGE_MESSAGE)}
      aria-label={`Copy a nudge message for ${username}`}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[0.75rem] font-medium text-ink-soft outline-none transition-[opacity,color,background-color] duration-150 ease-out hover:bg-panel-3 hover:text-ink focus-visible:bg-panel-3 focus-visible:opacity-100",
        "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100",
        copied && "[@media(hover:hover)]:opacity-100",
      )}
    >
      {copied ? (
        <span key={count} className="pass-pop items-center gap-1.5 text-up">
          <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          Copied
        </span>
      ) : (
        <>
          <Hand aria-hidden="true" className="size-3.5" />
          Nudge
        </>
      )}
    </button>
  )
}

function FriendRow({ trader, sort }: { trader: ReferredTrader; sort: SortKey }) {
  const trading = trader.firstTradeAt !== null
  const lastTradeAt = sort === "active" ? trader.lastTradeAt : null
  return (
    <li className={cn(ROW_GRID, "group h-[3.75rem] border-b border-line-soft")}>
      <span className="flex min-w-0 items-center gap-3">
        <WalletAvatar
          seed={trader.address}
          size="1.25rem"
          className={cn(!trading && "opacity-40 grayscale")}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-baseline gap-2.5">
            <span className={cn("truncate text-[0.875rem]", trading ? "text-ink" : "text-ink-quiet")}>
              {trader.username}
            </span>
            <span
              className="hidden shrink-0 font-mono text-[0.6875rem] text-ink-ghost @xs:inline"
              title={trader.address}
            >
              {shortAddress(trader.address)}
            </span>
          </span>
          {trading && lastTradeAt ? (
            <span
              className="whitespace-nowrap text-[0.6875rem] text-ink-quiet"
              title={formatExactTimeUtc(lastTradeAt)}
            >
              traded {formatRelativeTime(lastTradeAt)}
            </span>
          ) : trading ? (
            <span className="whitespace-nowrap font-mono text-[0.6875rem] tabular-nums text-ink-quiet @lg:hidden">
              {formatRoundedUsd(trader.volumeUsd)} vol
            </span>
          ) : (
            <span className="text-[0.75rem] text-ink-ghost @lg:hidden">Not trading yet</span>
          )}
        </span>
      </span>
      {trading ? (
        <>
          <span className="hidden text-right font-mono text-[0.8125rem] tabular-nums text-ink-quiet @lg:block">
            {formatRoundedUsd(trader.volumeUsd)}
          </span>
          <span className="text-right">
            <Exact value={trader.earnedUsd} />
          </span>
        </>
      ) : (
        <span className="flex items-center justify-end gap-3 @lg:col-span-2">
          <Nudge username={trader.username} />
          <span className="hidden whitespace-nowrap text-[0.8125rem] text-ink-ghost @lg:inline">
            Not trading yet
          </span>
        </span>
      )}
    </li>
  )
}

function ExampleCells({ friend }: { friend: ExampleFriend }) {
  return (
    <div className={cn(ROW_GRID, "h-full")}>
      <span className="flex min-w-0 items-center gap-3">
        <WalletAvatar seed={friend.address} size="1.25rem" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-baseline gap-2.5">
            <span className="truncate text-[0.875rem] text-ink">{friend.username}</span>
            <span className="hidden shrink-0 font-mono text-[0.6875rem] text-ink-ghost @xs:inline">
              {shortAddress(friend.address)}
            </span>
          </span>
          <span className="whitespace-nowrap font-mono text-[0.6875rem] tabular-nums text-ink-quiet @lg:hidden">
            {formatRoundedUsd(friend.volumeUsd, 0)} vol
          </span>
        </span>
      </span>
      <span className="hidden text-right font-mono text-[0.8125rem] tabular-nums text-ink-quiet @lg:block">
        {formatRoundedUsd(friend.volumeUsd, 0)}
      </span>
      <span className="text-right">
        <Exact value={friend.earnedUsd} />
      </span>
    </div>
  )
}

function SkeletonCells({ inert }: { inert: boolean }) {
  return (
    <div data-skeleton className={cn(ROW_GRID, "h-full")} inert={inert}>
      <span aria-hidden="true" className="flex min-w-0 items-center gap-3">
        <span className="size-[1.25rem] shrink-0 rounded-full bg-line ring-1 ring-line-soft" />
        <span className="flex min-w-0 flex-1 flex-col gap-[0.4rem]">
          <span data-bar className="h-[0.45rem] w-[6.5rem] max-w-full origin-left rounded-full bg-line" />
          <span data-bar className="h-[0.35rem] w-[4rem] max-w-full origin-left rounded-full bg-line-soft" />
        </span>
      </span>
      <span data-share className="flex justify-end @lg:col-span-2">
        <button
          type="button"
          data-tour="first-share"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SHARE_EVENT))}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[0.75rem] font-medium text-panel shadow-[0_0_0_0.3rem_rgb(244_244_245/0.07)] outline-none transition-[background-color,box-shadow] duration-150 ease-out hover:bg-white hover:shadow-[0_0_0_0.35rem_rgb(244_244_245/0.1)] focus-visible:ring-1 focus-visible:ring-ink-quiet focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
        >
          <UserPlus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
          Share with your first friend
        </button>
      </span>
    </div>
  )
}

type Stage = "rest" | "example" | "collapse"

function useShowcaseStage(enabled: boolean): [Stage, (stage: Stage) => void] {
  const [stage, setStage] = useState<Stage>("rest")
  useEffect(() => {
    if (!enabled) return
    const onStep = (event: Event) => {
      const detail = (event as CustomEvent<IntroStepDetail>).detail
      if (detail?.target === FRIENDS_TOUR_TARGET)
        setStage((current) => (current === "rest" ? "example" : current))
    }
    window.addEventListener(INTRO_STEP_EVENT, onStep)
    return () => window.removeEventListener(INTRO_STEP_EVENT, onStep)
  }, [enabled])
  useEffect(() => {
    if (stage !== "example") return
    const timer = window.setTimeout(() => setStage("collapse"), SHOWCASE_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [stage])
  return [stage, setStage]
}

function EmptyFriends({ stage, setStage }: { stage: Stage; setStage: (stage: Stage) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const topExampleRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLOListElement>(null)
  const exampleHeight = useRef(0)
  const showcase = stage !== "rest"

  useLayoutEffect(() => {
    if (stage !== "example") return
    exampleHeight.current = wrapRef.current?.offsetHeight ?? 0
    const fade = listRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 240,
      easing: "ease-out",
    })
    return () => fade?.cancel()
  }, [stage])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const list = listRef.current
    if (stage !== "collapse" || !wrap || !list) return
    const reduced = prefersReducedMotion()
    const expo = (duration: number, delay = 0) => ({
      duration,
      delay,
      easing: EASE_OUT_EXPO,
      fill: "both" as const,
    })
    const fade = (duration: number, delay = 0) => ({
      duration,
      delay,
      easing: "ease-out",
      fill: "both" as const,
    })
    const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-example-row]"))
    const skeleton = list.querySelector<HTMLElement>("[data-skeleton]")
    const bars = Array.from(list.querySelectorAll<HTMLElement>("[data-bar]"))
    const share = list.querySelector<HTMLElement>("[data-share]")
    const animations: Animation[] = []
    const run = (node: Element | null | undefined, frames: Keyframe[], timing: KeyframeAnimationOptions) => {
      if (node) animations.push(node.animate(frames, timing))
    }

    if (reduced) {
      rows.forEach((row) => run(row, [{ opacity: 1 }, { opacity: 0 }], fade(300)))
      run(topExampleRef.current, [{ opacity: 1 }, { opacity: 0 }], fade(300))
      run(skeleton, [{ opacity: 0 }, { opacity: 1 }], fade(300))
      run(stepsRef.current, [{ opacity: 0 }, { opacity: 1 }], fade(300))
    } else {
      const to = wrap.offsetHeight
      wrap.style.overflow = "hidden"
      run(
        wrap,
        [{ height: `${exampleHeight.current || to}px` }, { height: `${to}px` }],
        expo(COLLAPSE_MS - 100),
      )
      rows.forEach((row, index) =>
        run(
          row,
          [
            { transform: "translateY(0) scale(1)", opacity: 1 },
            { transform: `translateY(${-row.offsetTop}px) scale(0.97)`, opacity: 0 },
          ],
          expo(700, index * 30),
        ),
      )
      run(
        topExampleRef.current,
        [
          { opacity: 1, filter: "blur(0)" },
          { opacity: 0, filter: "blur(2px)" },
        ],
        fade(380, 160),
      )
      run(skeleton, [{ opacity: 0 }, { opacity: 1 }], fade(480, 300))
      bars.forEach((bar, index) =>
        run(bar, [{ transform: "scaleX(0.35)" }, { transform: "scaleX(1)" }], expo(560, 320 + index * 40)),
      )
      run(
        share,
        [
          { opacity: 0, transform: "translateX(0.6rem)" },
          { opacity: 1, transform: "translateX(0)" },
        ],
        expo(460, 440),
      )
      run(
        stepsRef.current,
        [
          { opacity: 0, transform: "translateY(0.6rem)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        expo(500, 400),
      )
    }

    let live = true
    Promise.all(animations.map((animation) => animation.finished)).then(
      () => {
        if (live) setStage("rest")
      },
      () => {},
    )
    return () => {
      live = false
      wrap.style.overflow = ""
      animations.forEach((animation) => animation.cancel())
    }
  }, [stage, setStage])

  return (
    <div ref={wrapRef} className="flex flex-col border-t border-line-soft">
      <ul
        ref={listRef}
        aria-label={showcase ? "Example friends" : undefined}
        className="relative flex flex-col"
      >
        <li className="relative h-[3.75rem] border-b border-line-soft">
          {showcase ? (
            <div ref={topExampleRef} aria-hidden={stage === "collapse"} className="absolute inset-0">
              <ExampleCells friend={EXAMPLE_FRIENDS[0]} />
            </div>
          ) : null}
          <div className={cn("h-full", stage === "example" && "opacity-0")}>
            <SkeletonCells inert={stage === "example"} />
          </div>
        </li>
        {showcase
          ? EXAMPLE_FRIENDS.slice(1).map((friend, index) => (
              <li
                key={friend.address}
                data-example-row
                aria-hidden={stage === "collapse"}
                className={cn(
                  "h-[3.75rem] border-b border-line-soft",
                  stage === "collapse" && "absolute inset-x-0",
                )}
                style={stage === "collapse" ? { top: `${(index + 1) * 3.75}rem` } : undefined}
              >
                <ExampleCells friend={friend} />
              </li>
            ))
          : null}
      </ul>
      <ol ref={stepsRef} className={cn("flex flex-col gap-2.5 pt-5", stage === "example" && "hidden")}>
        {INTRO_SENTENCES.map((text, index) => (
          <li key={text} className="flex max-w-[34rem] gap-3 text-[0.8125rem] leading-[1.5] text-ink-quiet">
            <span className="w-4 shrink-0 font-mono text-[0.6875rem] tabular-nums leading-[1.75] text-ink-ghost">
              {index + 1}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ExampleBadge({ stage }: { stage: Stage }) {
  if (stage === "rest") return null
  return (
    <span
      className={cn(
        "rounded-full border border-line px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-quiet transition-opacity duration-300 ease-out",
        stage === "example" ? "opacity-100" : "opacity-0",
      )}
    >
      Example
    </span>
  )
}

export function Friends({ traders }: { traders: ReferredTrader[] }) {
  const [stage, setStage] = useShowcaseStage(traders.length === 0)
  const [sort, setSort] = useState<SortKey>("earned")
  const [requestedPage, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(traders.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount - 1)
  const paged = traders.length > PAGE_SIZE
  const visible = sortFriends(traders, sort).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section data-tour="friends" aria-labelledby="pass-friends" className="@container flex flex-col gap-5">
      <div className="flex min-h-7 items-center justify-between gap-4">
        <h2 id="pass-friends" className="text-[0.9375rem] font-medium text-ink">
          Your friends
        </h2>
        {traders.length === 0 && <ExampleBadge stage={stage} />}
        {traders.length > 1 && (
          <SortTabs
            value={sort}
            onChange={(key) => {
              setSort(key)
              setPage(0)
            }}
          />
        )}
      </div>
      {traders.length === 0 ? (
        <EmptyFriends stage={stage} setStage={setStage} />
      ) : (
        <div className="flex flex-col">
          <ul className={cn("flex flex-col", paged && "min-h-[30rem]")}>
            {visible.map((trader) => (
              <FriendRow key={trader.address} trader={trader} sort={sort} />
            ))}
          </ul>
          {paged && <Pager page={page} pageCount={pageCount} total={traders.length} onChange={setPage} />}
        </div>
      )}
    </section>
  )
}
