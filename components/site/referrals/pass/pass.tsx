"use client"

import { Lock } from "lucide-react"
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react"
import { humane } from "@/components/onboarding/humane-font"
import { displayUrl } from "@/lib/referral-site/config"
import { formatPercent } from "@/lib/referral-site/format"
import { PASS_CSS } from "./pass-css"
import { QrCode } from "./qr-code"
import { CopyLinkIcon, ShareBar, ShareMenu } from "./share-menu"
import { mainSkin, skinFor } from "./skins"
import type { Skin, TicketState } from "./skins/types"

const MAX_TILT_DEG = 7

const loadShareBack = () => import("./share-back")

const ShareBack = lazy(() => loadShareBack().then((module) => ({ default: module.ShareBack })))

function preloadShareBack() {
  void loadShareBack()
}

function usernameFit(username: string): string {
  return `${(100 / Math.max(username.length * 0.24, 1)).toFixed(2)}cqi`
}

function usernameSize(username: string): string {
  return `min(9.5rem, ${usernameFit(username)})`
}

function LinkField({ url }: { url: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] opacity-60">Link</dt>
      <dd className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 cursor-text truncate font-mono text-[0.75rem] font-medium">
          {displayUrl(url)}
        </span>
        <CopyLinkIcon url={url} />
      </dd>
    </div>
  )
}

function track(face: HTMLElement | null, event: PointerEvent<HTMLElement>) {
  if (!face) return
  const box = face.getBoundingClientRect()
  face.style.setProperty("--mx", `${event.clientX - box.left}px`)
  face.style.setProperty("--my", `${event.clientY - box.top}px`)
}

function hasSelection(): boolean {
  return Boolean(window.getSelection()?.toString())
}

const FLIP_MS = 600

type Phase = "closed" | "open" | "closing"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function trapTab(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function useFlip(ticketRef: RefObject<HTMLDivElement | null>) {
  const [phase, setPhase] = useState<Phase>("closed")
  const firstRef = useRef<HTMLButtonElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)
  const open = phase === "open"

  const show = useCallback((from: HTMLElement | null) => {
    returnRef.current = from
    setPhase("open")
  }, [])

  const hide = useCallback(() => {
    setPhase((current) => (current === "open" ? "closing" : current))
    const target = returnRef.current ?? ticketRef.current
    target?.focus({ preventScroll: true })
  }, [ticketRef])

  useEffect(() => {
    if (phase === "open") {
      firstRef.current?.focus({ preventScroll: true })
      const onKey = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") hide()
      }
      document.addEventListener("keydown", onKey)
      return () => document.removeEventListener("keydown", onKey)
    }
    if (phase === "closing") {
      const id = window.setTimeout(() => setPhase("closed"), FLIP_MS)
      return () => window.clearTimeout(id)
    }
  }, [phase, hide])

  return { phase, open, firstRef, show, hide }
}

function memberLabel(memberNumber: number): string {
  return `Member #${String(memberNumber).padStart(4, "0")}`
}

function PassFront({
  username,
  url,
  referrerShare,
  cutNote,
  memberNumber,
  skin,
  bodyRef,
  stubRef,
  inert,
}: {
  username: string
  url: string
  referrerShare: string
  cutNote?: string
  memberNumber?: number
  skin?: Skin
  bodyRef: RefObject<HTMLDivElement | null>
  stubRef: RefObject<HTMLDivElement | null>
  inert?: boolean
}) {
  const art = skin ?? mainSkin
  return (
    <>
      <div
        ref={bodyRef}
        inert={inert}
        className="pass-face pass-body @container flex min-w-0 flex-1 flex-col justify-between gap-7 p-6 sm:gap-10 sm:p-9"
      >
        <art.Art part="body" />
        <div className="relative flex items-start justify-between gap-4">
          <span className="flex items-center gap-2.5">
            <img src="/entropy-logo-white.svg" alt="" className="pass-brand h-[1.05rem] w-auto" />
            {skin ? (
              <img src={skin.logo} alt="" className="pass-market-logo h-[1.4rem] w-auto rounded-[0.3rem]" />
            ) : null}
            <span className="whitespace-nowrap font-mono text-[0.625rem] font-medium uppercase tracking-[0.22em]">
              {skin ? `${skin.id} pass` : "Invite pass"}
            </span>
          </span>
          {memberNumber === undefined ? null : (
            <span className="hidden whitespace-nowrap font-mono text-[0.625rem] uppercase tracking-[0.14em] opacity-70 @2xs:inline">
              {memberLabel(memberNumber)}
            </span>
          )}
        </div>
        <div className="relative flex min-w-0 flex-col gap-2">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] opacity-70">
            {skin ? `Trade ${skin.name} with` : "Trade io with"}
          </span>
          <span
            className="pass-name block font-bold leading-[0.78]"
            style={{
              fontFamily: humane.style.fontFamily,
              fontSize: usernameSize(username),
              ["--name-fit" as string]: usernameFit(username),
            }}
          >
            {username}
          </span>
        </div>
        <dl className="relative grid grid-cols-1">
          <LinkField url={url} />
        </dl>
        <span className="pass-sheen" />
      </div>
      <div ref={stubRef} inert={inert} className="pass-face pass-stub">
        <art.Art part="stub" />
        <span className="pass-perf" aria-hidden="true" />
        <span className="pass-cut">
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] opacity-60">Your cut</span>
          <span
            className="pass-cut-value font-bold leading-[0.8]"
            style={{ fontFamily: humane.style.fontFamily }}
          >
            {formatPercent(referrerShare)}
          </span>
          <span className="pass-cut-note max-w-[10rem] text-[0.6875rem] font-medium leading-[1.35]">
            {cutNote ?? `of Entropy's fees on your friends' ${skin ? skin.name : "io"} trades`}
          </span>
        </span>
        <QrCode url={url} />
        <span className="pass-sheen" />
      </div>
    </>
  )
}

function useTilt() {
  const passRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const stubRef = useRef<HTMLDivElement>(null)

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const pass = passRef.current
    if (!pass || event.pointerType !== "mouse" || pass.dataset.flipped === "true") return
    const box = pass.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    pass.style.setProperty("--ry", `${(x * MAX_TILT_DEG * 2).toFixed(2)}deg`)
    pass.style.setProperty("--rx", `${(-y * MAX_TILT_DEG * 1.4).toFixed(2)}deg`)
    pass.style.setProperty("--glow", "1")
    pass.dataset.active = "true"
    track(bodyRef.current, event)
    track(stubRef.current, event)
  }

  const leave = () => {
    const pass = passRef.current
    if (!pass) return
    pass.style.setProperty("--ry", "0deg")
    pass.style.setProperty("--rx", "0deg")
    pass.style.setProperty("--glow", "0")
    pass.dataset.active = "false"
  }

  return { passRef, bodyRef, stubRef, move, leave }
}

type PassProps = {
  username: string
  url: string
  code: string
  address: string
  issuedAt?: string
  referrerShare: string
  cutNote?: string
  memberNumber?: number
  market?: string
  state?: TicketState
  share?: "strip" | "below"
  lock?: PassLock
}

export type PassLock = {
  note: string
  progress: number
  href: string
  cta: string
  status: string
}

function LockFace({ lock }: { lock: PassLock }) {
  return (
    <span className="pass-lock">
      <Lock aria-hidden="true" className="pass-lock-icon" strokeWidth={2.25} />
      <span className="pass-lock-note">{lock.note}</span>
      <span className="pass-lock-bar" aria-hidden="true">
        <span style={{ width: `${Math.max(lock.progress * 100, 2)}%` }} />
      </span>
    </span>
  )
}

function LockBar({ lock }: { lock: PassLock }) {
  return (
    <div className="flex w-full min-w-0 items-center gap-4">
      <a href={lock.href} target="_blank" rel="noopener noreferrer" className="pass-copy group shrink-0">
        {lock.cta}
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        >
          →
        </span>
      </a>
      <span className="truncate font-mono text-[0.75rem] tabular-nums text-ink-quiet">{lock.status}</span>
    </div>
  )
}

function SkinStyles({ skin }: { skin: Skin }) {
  return (
    <>
      <style href="pass-styles" precedence="default">
        {PASS_CSS}
      </style>
      <style href={`ticket-skin-${skin.id}`} precedence="default">
        {skin.css}
      </style>
    </>
  )
}

function StripPass({
  username,
  url,
  code,
  referrerShare,
  cutNote,
  memberNumber,
  market,
  state = "unlocked",
}: PassProps) {
  const skin = market ? skinFor(market) : undefined
  const { passRef, bodyRef, stubRef, move, leave } = useTilt()
  const ticketRef = useRef<HTMLDivElement>(null)

  return (
    <div className="pass-stage pass-rise">
      <SkinStyles skin={skin ?? mainSkin} />
      <ShareMenu url={url} code={code} username={username} ticketRef={ticketRef}>
        {({ open, strip }) => {
          const activate = (event: MouseEvent<HTMLDivElement>) => {
            if (hasSelection()) return
            if (event.target instanceof Element && event.target.closest("button, a")) return
            open()
          }
          return (
            <div
              ref={passRef}
              onPointerMove={move}
              onPointerLeave={leave}
              className="pass-card"
              data-skin={skin?.id ?? "main"}
              data-state={state}
              data-share="strip"
              role="group"
              aria-label="Your invite pass"
            >
              <div ref={ticketRef} onClick={activate} className="pass-ticket">
                <PassFront
                  username={username}
                  url={url}
                  referrerShare={referrerShare}
                  cutNote={cutNote}
                  memberNumber={memberNumber}
                  skin={skin}
                  bodyRef={bodyRef}
                  stubRef={stubRef}
                />
              </div>
              {strip}
            </div>
          )
        }}
      </ShareMenu>
    </div>
  )
}

function FlipPass({
  username,
  url,
  code,
  referrerShare,
  cutNote,
  memberNumber,
  market,
  state = "unlocked",
  lock,
}: PassProps) {
  const skin = market ? skinFor(market) : undefined
  const { passRef, bodyRef, stubRef, move, leave } = useTilt()
  const ticketRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const { phase, open, firstRef, show, hide } = useFlip(ticketRef)
  const art = skin ?? mainSkin

  const flip = (from: HTMLElement | null) => {
    if (lock) return
    const ticket = ticketRef.current
    const body = bodyRef.current
    if (ticket && body) ticket.style.setProperty("--perf-y", `${body.offsetHeight}px`)
    leave()
    show(from)
  }

  const activate = (event: MouseEvent<HTMLDivElement>) => {
    if (open || hasSelection()) return
    if (event.target instanceof Element && event.target.closest("button, a, input, [role=dialog]")) return
    flip(ticketRef.current)
  }

  const flipRef = useRef(flip)
  useEffect(() => {
    flipRef.current = flip
  })

  useEffect(() => {
    const openShare = () => {
      const ticket = ticketRef.current
      if (!ticket || ticket.dataset.locked === "true") return
      ticket.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
      flipRef.current(ticket)
    }
    window.addEventListener("entropy:open-share", openShare)
    return () => window.removeEventListener("entropy:open-share", openShare)
  }, [])

  const dismiss = (event: MouseEvent<HTMLDivElement>) => {
    if (!open || hasSelection()) return
    if (event.target instanceof Element && event.target.closest("a, button, input, label, textarea, select"))
      return
    hide()
  }

  let back: ReactNode = null
  if (phase !== "closed") {
    back = (
      <Suspense fallback={null}>
        <ShareBack url={url} code={code} username={username} titleId={titleId} firstRef={firstRef} />
      </Suspense>
    )
  }

  return (
    <div className="pass-flip" data-phase={phase}>
      <div className="pass-scrim" aria-hidden="true" onClick={hide} />
      <div className="pass-stage pass-rise">
        <SkinStyles skin={skin ?? mainSkin} />
        <div
          ref={passRef}
          onPointerEnter={lock ? undefined : preloadShareBack}
          onFocus={lock ? undefined : preloadShareBack}
          onPointerMove={move}
          onPointerLeave={leave}
          className="pass-card"
          data-skin={skin?.id ?? "main"}
          data-state={state}
          data-share="below"
          data-flipped={open}
          data-locked={Boolean(lock)}
          role="group"
          aria-label={lock ? `Locked pass. ${lock.note}` : "Your invite pass"}
        >
          <div
            ref={ticketRef}
            tabIndex={-1}
            onClick={activate}
            data-locked={Boolean(lock)}
            className="pass-ticket"
          >
            <PassFront
              username={username}
              url={url}
              referrerShare={referrerShare}
              cutNote={cutNote}
              memberNumber={memberNumber}
              skin={skin}
              bodyRef={bodyRef}
              stubRef={stubRef}
              inert={open || Boolean(lock)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-hidden={!open}
              inert={!open}
              onKeyDown={trapTab}
              onClick={dismiss}
              className="pass-face pass-back"
            >
              <span aria-hidden="true" className="pass-back-art">
                <art.Art part="body" />
              </span>
              {back}
            </div>
            {lock ? <LockFace lock={lock} /> : null}
          </div>
        </div>
      </div>
      {lock ? <LockBar lock={lock} /> : <ShareBar url={url} code={code} username={username} />}
    </div>
  )
}

export function Pass(props: PassProps) {
  return props.share === "below" ? <FlipPass {...props} /> : <StripPass {...props} />
}
