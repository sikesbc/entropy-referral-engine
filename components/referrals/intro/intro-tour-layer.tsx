"use client"

import { ArrowRight, Mail } from "lucide-react"
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { createPortal } from "react-dom"
import { EmailCapture, METAL_BUTTON_CLASS, type EmailSave } from "@/components/referrals/email/email-ask"
import { useEmailSettings } from "@/components/referrals/email/use-email-settings"
import { cn } from "@/lib/utils"
import { burst, sweep } from "./foil"
import { EASE_OUT_EXPO, INTRO_ASK_COPY, INTRO_SHARE_DISMISS, INTRO_SHARE_NOW } from "./intro-copy"
import { announceIntroStep, landIntro, launchIntro, setIntroStep } from "./intro-store"
import { prefersReducedMotion, useReducedMotion } from "./use-reduced-motion"

export type IntroStep = {
  target: string
  title?: string
  text?: string
  detail?: string
  floating?: boolean
  action?: boolean
  slot?: string
  fallback?: string
  when?: string
}

type Box = { x: number; y: number; w: number; h: number }
type Point = { x: number; y: number }
type Side = "left" | "right" | "top" | "bottom" | "none"
type Placement = Point & { side: Side }
type Glide = {
  start: number
  duration: number
  hole: Box | null
  card: Point | null
  scrollFrom: number
  scrollTo: number
  driving: boolean
  wrote: number | null
  fit: boolean
}

const HOLE_PAD = 14
const HOLE_RADIUS = 18
const GAP = 22
const EDGE = 16
const ARM_DELAY_MS = 450
const GLIDE_MS = 640
const FLY_MS = 550
const SAFE_TOP = 72
const SAFE_BOTTOM = 24
const ASK_TARGET = "[data-intro-ask-none]"
const OPEN_SHARE_EVENT = "entropy:open-share"
const ASK_HOLD_MS = 1500
const ARROW = 12
const ARROW_INSET = 22
const SURFACE = "oklch(0.232 0.009 268)"
const FOIL = "linear-gradient(90deg, #b9bcc6 0%, #f4f5f8 35%, #d8dcf0 55%, #f1e9f7 75%, #c3c6cf 100%)"

const SKIN_STYLE: CSSProperties = {
  border: "1px solid transparent",
  background: [
    "radial-gradient(120% 80% at 0% 0%, rgb(255 255 255 / 0.055), transparent 60%) padding-box",
    "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.006) 0 1px, transparent 1px 3px) padding-box",
    `linear-gradient(${SURFACE}, ${SURFACE}) padding-box`,
    "linear-gradient(155deg, rgb(255 255 255 / 0.34), rgb(255 255 255 / 0.11) 24%, rgb(255 255 255 / 0.07) 60%, rgb(214 220 255 / 0.22)) border-box",
  ].join(", "),
  boxShadow:
    "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 0 0 0.5px rgb(4 5 8 / 0.7), 0 2px 6px rgb(4 5 8 / 0.35), 0 28px 64px -20px rgb(4 5 8 / 0.9)",
}

const ARROW_STYLE: CSSProperties = {
  width: ARROW,
  height: ARROW,
  background: SURFACE,
  borderColor: "rgb(255 255 255 / 0.15)",
  borderRadius: 2,
}

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : (1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10))
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function mixBox(from: Box, to: Box, amount: number): Box {
  return {
    x: mix(from.x, to.x, amount),
    y: mix(from.y, to.y, amount),
    w: mix(from.w, to.w, amount),
    h: mix(from.h, to.h, amount),
  }
}

function roots(selector: string): HTMLElement[] {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector))
  return nodes.filter((node) => !nodes.some((other) => other !== node && other.contains(node)))
}

function measure(selector: string): Box | null {
  const rects = roots(selector)
    .map((node) => node.getBoundingClientRect())
    .filter((rect) => rect.width > 0)
  if (rects.length === 0) return null
  const left = Math.min(...rects.map((rect) => rect.left))
  const top = Math.min(...rects.map((rect) => rect.top))
  const right = Math.max(...rects.map((rect) => rect.right))
  const bottom = Math.max(...rects.map((rect) => rect.bottom))
  return { x: left, y: top, w: right - left, h: bottom - top }
}

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
}

function scrollGoal(selector: string): number {
  const now = window.scrollY
  const box = measure(selector)
  const vh = window.innerHeight
  if (!box || (box.y >= SAFE_TOP && box.y + box.h <= vh - SAFE_BOTTOM)) return now
  const shift = box.h > vh - SAFE_TOP - SAFE_BOTTOM ? box.y - SAFE_TOP : box.y + box.h / 2 - vh / 2
  return clamp(now + shift, 0, maxScroll())
}

function fitGoal(selector: string, size: { w: number; h: number }): number {
  const box = measure(selector)
  if (!box) return window.scrollY
  const spot = hole(box)
  const vw = window.innerWidth
  const beside = spot.x + spot.w + GAP + size.w <= vw - EDGE || spot.x - GAP - size.w >= EDGE
  const bottom = window.scrollY + spot.y + spot.h + (beside ? SAFE_BOTTOM : GAP + size.h + EDGE)
  return clamp(bottom - window.innerHeight, 0, maxScroll())
}

function startGlide(
  selector: string,
  from: { hole: Box; card: Point } | null,
  fit: { w: number; h: number } | null = null,
): Glide {
  const scrollFrom = window.scrollY
  const scrollTo = fit ? fitGoal(selector, fit) : scrollGoal(selector)
  return {
    start: performance.now(),
    duration: prefersReducedMotion() ? 0 : GLIDE_MS,
    hole: from?.hole ?? null,
    card: from?.card ?? null,
    scrollFrom,
    scrollTo,
    driving: fit !== null || Math.abs(scrollTo - scrollFrom) > 0.5,
    wrote: null,
    fit: fit !== null,
  }
}

function hole(target: Box): Box {
  return {
    x: target.x - HOLE_PAD,
    y: target.y - HOLE_PAD,
    w: target.w + HOLE_PAD * 2,
    h: target.h + HOLE_PAD * 2,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function place(spot: Box | null, size: { w: number; h: number }, vw: number, vh: number): Placement {
  if (!spot) return { x: (vw - size.w) / 2, y: (vh - size.h) / 2, side: "none" }
  const alignY = clamp(spot.y, EDGE, vh - size.h - EDGE)
  const alignX = clamp(spot.x, EDGE, vw - size.w - EDGE)
  const right = spot.x + spot.w + GAP
  if (right + size.w <= vw - EDGE) return { x: right, y: alignY, side: "left" }
  const left = spot.x - GAP - size.w
  if (left >= EDGE) return { x: left, y: alignY, side: "right" }
  const below = spot.y + spot.h + GAP
  if (below + size.h <= vh - EDGE) return { x: alignX, y: below, side: "top" }
  const above = spot.y - GAP - size.h
  if (above >= EDGE) return { x: alignX, y: above, side: "bottom" }
  return { x: alignX, y: vh - size.h - EDGE, side: "none" }
}

function overlapMid(start: number, length: number, from: number, span: number) {
  const low = Math.max(start, from)
  const high = Math.min(start + length, from + span)
  const mid = low <= high ? (low + high) / 2 : from + span / 2
  return clamp(mid - start, ARROW_INSET, length - ARROW_INSET)
}

function arrowAt(side: Side, hole: Box, card: Point, size: { w: number; h: number }): string {
  if (side === "left") return `${-ARROW / 2}px,${overlapMid(card.y, size.h, hole.y, hole.h) - ARROW / 2}px`
  if (side === "right")
    return `${size.w - ARROW / 2}px,${overlapMid(card.y, size.h, hole.y, hole.h) - ARROW / 2}px`
  if (side === "top") return `${overlapMid(card.x, size.w, hole.x, hole.w) - ARROW / 2}px,${-ARROW / 2}px`
  if (side === "bottom")
    return `${overlapMid(card.x, size.w, hole.x, hole.w) - ARROW / 2}px,${size.h - ARROW / 2}px`
  return ""
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function Receipt({ text }: { text: string }) {
  const rows = text.split(" → ")
  return (
    <p className="flex flex-col rounded-[0.45rem] bg-[rgb(6_7_10/0.35)] px-[0.7rem] py-[0.5rem] font-mono text-[0.65rem] leading-[1.75] tabular-nums shadow-[inset_0_1px_2px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.035)]">
      {rows.map((row, at) => {
        const cut = row.lastIndexOf(" ")
        const label = cut > 0 ? row.slice(0, cut) : row
        const amount = cut > 0 ? row.slice(cut + 1) : ""
        const total = at === rows.length - 1 && rows.length > 1
        return (
          <span
            key={row}
            className={cn(
              "flex items-baseline gap-[0.45rem]",
              total
                ? "mt-[0.2rem] border-t border-dashed border-white/[0.12] pt-[0.2rem] text-ink"
                : "text-ink-quiet",
            )}
          >
            <span className={cn("w-[0.7rem] shrink-0", total ? "text-ink-soft" : "text-ink-ghost")}>
              {at > 0 ? "→" : ""}
            </span>
            <span>{label}</span>
            <span
              aria-hidden="true"
              className="min-w-[0.5rem] flex-1 -translate-y-[0.25em] border-b border-dotted border-white/[0.14]"
            />
            <span className={total ? "font-medium text-up" : "text-ink-soft"}>{amount}</span>
          </span>
        )
      })}
    </p>
  )
}

const FOCUSABLE = "button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])"

function focusables(selector: string): HTMLElement[] {
  return roots(selector).flatMap((node) =>
    node.matches(FOCUSABLE) ? [node] : Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)),
  )
}

function cutout(box: Box | null, vw: number, vh: number): string {
  if (!box) return "none"
  const right = box.x + box.w
  const bottom = box.y + box.h
  return `path(evenodd, "M0 0H${vw}V${vh}H0Z M${box.x} ${box.y}H${right}V${bottom}H${box.x}Z")`
}

function focusTarget(selector: string): HTMLElement | null {
  const node = document.querySelector<HTMLElement>(selector)
  if (!node) return null
  if (node.matches("button, a[href], [tabindex]")) return node
  return node.querySelector<HTMLElement>("button, a[href], [tabindex]") ?? node
}

export function TourLayer({
  steps,
  pillTarget,
  startAt,
}: {
  steps: IntroStep[]
  pillTarget: string
  startAt: number
}) {
  const [index, setIndex] = useState(() => clamp(startAt, 0, steps.length - 1))
  const [armed, setArmed] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [asking, setAsking] = useState(false)
  const [saved, setSaved] = useState(false)
  const emailSettings = useEmailSettings()
  const reduced = useReducedMotion()
  const calloutRef = useRef<HTMLDivElement>(null)
  const skinRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const holeRef = useRef<SVGRectElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const actingRef = useRef(false)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const stepped = useRef(false)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const leftRef = useRef(false)
  const targetRef = useRef(steps[clamp(startAt, 0, steps.length - 1)].target)
  const glideRef = useRef<Glide | null>(null)
  const shownRef = useRef<{ hole: Box; card: Point } | null>(null)
  const countId = useId()
  const titleId = useId()
  const textId = useId()
  const step = steps[index]
  const last = index === steps.length - 1
  const shown = armed && placed && !leaving
  const acting = step.action === true && !asking
  const needsEmail = !emailSettings.loading && !emailSettings.settings?.email

  useEffect(() => {
    const timer = window.setTimeout(() => setArmed(true), ARM_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let id = 0
    let written = ""
    const tick = (now: number) => {
      id = requestAnimationFrame(tick)
      const callout = calloutRef.current
      const rect = holeRef.current
      const overlay = overlayRef.current
      if (!callout || !rect || !overlay) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const glide = glideRef.current
      let amount = 1
      let pending = 0
      if (glide) {
        amount = glide.duration > 0 ? clamp((now - glide.start) / glide.duration, 0, 1) : 1
        if (glide.wrote !== null && Math.abs(window.scrollY - glide.wrote) > 2) glide.driving = false
        if (glide.driving) {
          if (glide.fit)
            glide.scrollTo = fitGoal(targetRef.current, { w: callout.offsetWidth, h: callout.offsetHeight })
          glide.scrollTo = Math.min(glide.scrollTo, maxScroll())
          const top = mix(glide.scrollFrom, glide.scrollTo, easeOutExpo(amount))
          if (Math.abs(top - window.scrollY) > 0.25) window.scrollTo({ top, behavior: "instant" })
          glide.wrote = window.scrollY
          pending = window.scrollY - glide.scrollTo
        }
      }
      const size = { w: callout.offsetWidth, h: callout.offsetHeight }
      const box = measure(targetRef.current)
      const spot = box ? hole({ ...box, y: box.y + pending }) : null
      const anchor = place(spot, size, vw, vh)
      const card = { x: anchor.x, y: anchor.y }
      const end = spot ?? { x: card.x + size.w / 2, y: card.y + size.h / 2, w: 0, h: 0 }
      let next = { hole: end, card }
      if (glide && amount < 1 && glide.hole && glide.card) {
        const eased = easeOutExpo(amount)
        next = {
          hole: mixBox(glide.hole, end, eased),
          card: { x: mix(glide.card.x, card.x, eased), y: mix(glide.card.y, card.y, eased) },
        }
      }
      if (glide && amount >= 1) glideRef.current = null
      shownRef.current = next
      const side = spot ? anchor.side : "none"
      const point = arrowAt(side, next.hole, next.card, size)
      const pass = actingRef.current && box ? { ...box, y: box.y + pending } : null
      const key = [
        next.hole.x,
        next.hole.y,
        next.hole.w,
        next.hole.h,
        next.card.x,
        next.card.y,
        size.w,
        size.h,
      ]
        .concat(pass ? [pass.x, pass.y, pass.w, pass.h] : [])
        .map((value) => value.toFixed(1))
        .concat(side)
        .join()
      if (key === written) return
      written = key
      rect.setAttribute("x", String(next.hole.x))
      rect.setAttribute("y", String(next.hole.y))
      rect.setAttribute("width", String(next.hole.w))
      rect.setAttribute("height", String(next.hole.h))
      callout.style.transform = `translate3d(${next.card.x}px, ${next.card.y}px, 0)`
      overlay.style.clipPath = cutout(pass, vw, vh)
      const arrow = arrowRef.current
      if (arrow) {
        arrow.dataset.side = side
        if (point) arrow.style.transform = `translate(${point}) rotate(45deg)`
      }
      setPlaced(true)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!armed) return
    if (asking) calloutRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true })
    else primaryRef.current?.focus({ preventScroll: true })
  }, [armed, index, asking])

  useLayoutEffect(() => {
    actingRef.current = acting && !leaving
  }, [acting, leaving])

  useLayoutEffect(() => {
    if (!stepped.current) {
      stepped.current = true
      return
    }
    if (prefersReducedMotion()) return
    bodyRef.current?.animate(
      [
        { opacity: 0, transform: "translateY(0.3rem)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 340, easing: EASE_OUT_EXPO },
    )
  }, [index, asking])

  useEffect(() => {
    announceIntroStep({ step: index, target: step.target })
  }, [index, step.target])

  useEffect(() => () => announceIntroStep({ step: null, target: null }), [])

  function fitFor(at: number) {
    const callout = calloutRef.current
    if (!steps[at].action || !callout) return null
    return { w: callout.offsetWidth, h: callout.offsetHeight }
  }

  useLayoutEffect(() => {
    glideRef.current = startGlide(targetRef.current, null, fitFor(index))
  }, [])

  function go(next: number) {
    targetRef.current = steps[next].target
    glideRef.current = startGlide(steps[next].target, shownRef.current, fitFor(next))
    setIndex(next)
    setIntroStep(next)
  }

  const celebrate = useCallback((button: HTMLButtonElement) => {
    setSaved(true)
    calloutRef.current?.focus({ preventScroll: true })
    if (prefersReducedMotion()) return
    if (calloutRef.current) burst(calloutRef.current, button)
    if (skinRef.current) sweep(skinRef.current)
  }, [])

  const sendEmail: EmailSave = (address, done) => {
    emailSettings.save.mutate(
      { email: address, prefs: { boost: true, unlock: true } },
      { onSuccess: () => done.onSuccess(), onError: () => done.onError() },
    )
  }

  function ask() {
    targetRef.current = ASK_TARGET
    glideRef.current = startGlide(ASK_TARGET, shownRef.current)
    setAsking(true)
  }

  function land(focusPill: boolean) {
    landIntro()
    if (focusPill) window.requestAnimationFrame(() => focusTarget(pillTarget)?.focus({ preventScroll: true }))
  }

  function finish() {
    exit(true)
  }

  function decline() {
    if (needsEmail) ask()
    else finish()
  }

  function exit(focusPill: boolean) {
    if (leftRef.current) return
    leftRef.current = true
    glideRef.current = null
    actingRef.current = false
    setLeaving(true)
    launchIntro()
    const settle = () => land(focusPill)
    const callout = calloutRef.current
    const skin = skinRef.current
    const content = contentRef.current
    arrowRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 120,
      easing: "ease-out",
      fill: "forwards",
    })
    const pill = document.querySelector<HTMLElement>(pillTarget)
    const to = pill?.getBoundingClientRect()
    if (!callout || !skin || !content || !to || to.width === 0 || prefersReducedMotion()) {
      if (!callout) return settle()
      callout
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-out", fill: "forwards" })
        .finished.then(settle, settle)
      return
    }
    const from = callout.getBoundingClientRect()
    const sx = to.width / from.width
    const sy = to.height / from.height
    const radius = to.height / 2
    const startRadius = getComputedStyle(skin).borderTopLeftRadius
    const start = `translate3d(${from.left}px, ${from.top}px, 0) scale(1, 1)`
    const end = `translate3d(${to.left}px, ${to.top}px, 0) scale(${sx}, ${sy})`
    const timing = { duration: FLY_MS, easing: EASE_OUT_EXPO, fill: "forwards" as const }
    content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-out", fill: "forwards" })
    skin.animate(
      [{ borderRadius: startRadius }, { borderRadius: `${radius / sx}px / ${radius / sy}px` }],
      timing,
    )
    callout
      .animate(
        [
          { transform: start, opacity: 1 },
          { transform: end, opacity: 1, offset: 0.82 },
          { transform: end, opacity: 0 },
        ],
        timing,
      )
      .finished.then(settle, settle)
  }

  function next() {
    if (!last) go(index + 1)
    else if (needsEmail) ask()
    else finish()
  }

  function shareNow() {
    exit(false)
    window.dispatchEvent(new CustomEvent(OPEN_SHARE_EVENT))
  }

  const finishLater = useEffectEvent(() => finish())
  const shareTaken = useEffectEvent(() => exit(false))

  useEffect(() => {
    if (!acting || leaving) return
    const nodes = roots(step.target)
    const onClick = () => shareTaken()
    nodes.forEach((node) => node.addEventListener("click", onClick, true))
    return () => nodes.forEach((node) => node.removeEventListener("click", onClick, true))
  }, [acting, leaving, step.target])

  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(finishLater, prefersReducedMotion() ? 900 : ASK_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [saved])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (leaving) return
      if (event.key === "Tab") return trap(event)
      if (event.key !== "Escape") return
      event.preventDefault()
      if (acting) decline()
      else finish()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  })

  function trap(event: globalThis.KeyboardEvent) {
    const callout = calloutRef.current
    if (!callout) return
    const own = Array.from(
      callout.querySelectorAll<HTMLElement>("input:not([disabled]), button:not([disabled])"),
    )
    const outside = acting ? focusables(step.target) : []
    const order = [...own, ...outside]
    const active = document.activeElement
    const inside =
      active instanceof Node && (callout.contains(active) || outside.some((node) => node.contains(active)))
    if (order.length === 0 || !inside) return
    const at = order.findIndex((node) => node.contains(active))
    const nextAt = event.shiftKey ? (at <= 0 ? order.length - 1 : at - 1) : (at + 1) % order.length
    event.preventDefault()
    order[nextAt]?.focus()
  }

  return createPortal(
    <>
      <div
        ref={overlayRef}
        aria-hidden="true"
        onClick={leaving ? undefined : asking ? finish : acting ? decline : undefined}
        className="fixed inset-0 z-[70]"
        style={{
          opacity: shown ? 1 : 0,
          pointerEvents: shown ? "auto" : "none",
          transition: `opacity ${leaving ? 320 : 360}ms ease-out`,
        }}
      >
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <filter
              id={`${countId}-soft`}
              filterUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="100%"
              height="100%"
            >
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <mask id={`${countId}-cut`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <rect width="100%" height="100%" fill="white" />
              <rect
                ref={holeRef}
                data-intro-hole=""
                x="0"
                y="0"
                width="0"
                height="0"
                rx={HOLE_RADIUS}
                fill="black"
                filter={`url(#${countId}-soft)`}
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgb(5 6 9 / 0.76)" mask={`url(#${countId}-cut)`} />
        </svg>
      </div>
      <div
        ref={calloutRef}
        role="dialog"
        aria-modal={!acting}
        aria-labelledby={asking ? titleId : `${countId} ${titleId}`}
        aria-describedby={asking || !step.text ? undefined : textId}
        tabIndex={-1}
        data-intro-callout=""
        data-acting={acting || undefined}
        className={cn(
          "fixed left-0 top-0 z-[71] origin-top-left outline-none",
          asking ? "w-[18rem]" : "w-[16.5rem]",
        )}
        style={{
          opacity: shown || leaving ? 1 : 0,
          visibility: placed ? "visible" : "hidden",
          pointerEvents: shown ? "auto" : "none",
          transition: "opacity 260ms ease-out",
        }}
      >
        <div
          className="relative transition-transform duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{ transform: shown || leaving || reduced ? "none" : "translateY(0.35rem) scale(0.98)" }}
        >
          <div
            ref={skinRef}
            className="absolute inset-0 overflow-hidden rounded-[0.75rem]"
            style={SKIN_STYLE}
          />
          <span
            ref={arrowRef}
            aria-hidden="true"
            data-side="none"
            className="absolute left-0 top-0 z-[1] border-0 border-solid data-[side=bottom]:border-b data-[side=bottom]:border-r data-[side=left]:border-b data-[side=left]:border-l data-[side=none]:hidden data-[side=right]:border-r data-[side=right]:border-t data-[side=top]:border-l data-[side=top]:border-t"
            style={ARROW_STYLE}
          />
          <div
            ref={contentRef}
            className="relative z-[2] flex flex-col gap-[0.85rem] px-[1.05rem] pb-[0.95rem] pt-[0.9rem]"
          >
            {asking ? (
              <>
                <div ref={bodyRef} className="flex flex-col gap-[0.95rem]">
                  <span
                    aria-hidden="true"
                    className="grid size-[1.9rem] place-items-center rounded-full bg-[linear-gradient(180deg,#f3f4f7_0%,#d5d7de_55%,#aeb1ba_100%)] text-[#17181d] shadow-[inset_0_1px_0_rgb(255_255_255/0.9),inset_0_-1px_0_rgb(20_22_30/0.22),0_2px_8px_-2px_rgb(4_5_8/0.6)]"
                  >
                    <Mail className="size-[0.85rem]" strokeWidth={2.2} />
                  </span>
                  <p
                    id={titleId}
                    className="text-[0.9375rem] font-semibold leading-[1.3] tracking-[-0.005em] text-ink [text-wrap:balance]"
                  >
                    {INTRO_ASK_COPY.title}
                  </p>
                  <EmailCapture
                    question={INTRO_ASK_COPY.text}
                    success={INTRO_ASK_COPY.success}
                    failure={INTRO_ASK_COPY.error}
                    save={sendEmail}
                    onDone={celebrate}
                  />
                </div>
                <div className="-mt-[0.2rem] flex justify-end">
                  <button
                    type="button"
                    onClick={() => finish()}
                    className={cn(
                      "-mr-[0.35rem] h-[1.6rem] rounded-full px-[0.35rem] text-[0.6875rem] text-ink-quiet outline-none transition-[color,opacity] duration-200 hover:text-ink-soft focus-visible:text-ink focus-visible:ring-1 focus-visible:ring-white/25",
                      saved && "pointer-events-none opacity-0",
                    )}
                    tabIndex={saved ? -1 : undefined}
                  >
                    {INTRO_ASK_COPY.dismiss}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-[0.8rem]">
                  <span
                    id={countId}
                    className="shrink-0 font-mono text-[0.6rem] tabular-nums tracking-[0.16em] text-ink-quiet"
                  >
                    <span className="sr-only">
                      How it works, step {index + 1} of {steps.length}
                    </span>
                    <span aria-hidden="true">
                      <span className="text-ink">{pad(index + 1)}</span> / {pad(steps.length)}
                    </span>
                  </span>
                  <span aria-hidden="true" className="flex flex-1 items-center gap-[0.2rem]">
                    {steps.map((item, at) => (
                      <span
                        key={at}
                        className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/[0.08]"
                      >
                        <span
                          className="absolute inset-0 origin-left rounded-full transition-[transform,opacity] duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                          style={{
                            transform: `scaleX(${at <= index ? 1 : 0})`,
                            opacity: at === index ? 1 : 0.38,
                            background: at === index ? FOIL : "#e4e5ea",
                          }}
                        />
                      </span>
                    ))}
                  </span>
                </div>
                <div ref={bodyRef} className="flex flex-col gap-[0.75rem]">
                  <div aria-live="polite" className="flex flex-col gap-[0.35rem]">
                    {step.title ? (
                      <p
                        id={titleId}
                        className={cn(
                          "font-semibold tracking-[-0.005em] text-ink",
                          acting
                            ? "text-[1.125rem] leading-[1.25] [text-wrap:balance]"
                            : "text-[0.9375rem] leading-[1.3]",
                        )}
                      >
                        {step.title}
                      </p>
                    ) : null}
                    {step.text ? (
                      <p
                        id={textId}
                        className={cn(
                          "text-[0.75rem] leading-[1.55] [text-wrap:pretty]",
                          step.title ? "text-ink-soft" : "text-ink",
                        )}
                      >
                        {step.text}
                      </p>
                    ) : null}
                  </div>
                  {step.detail ? <Receipt text={step.detail} /> : null}
                </div>
                {acting ? (
                  <div className="flex flex-col items-stretch gap-[0.35rem]">
                    <button
                      ref={primaryRef}
                      type="button"
                      onClick={shareNow}
                      className="lite-raised-orange inline-flex h-[2.3rem] items-center justify-center gap-[0.4rem] rounded-full text-[0.8125rem] outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.232_0.009_268)]"
                    >
                      {INTRO_SHARE_NOW}
                      <ArrowRight aria-hidden="true" className="size-[0.8rem]" strokeWidth={2.4} />
                    </button>
                    <button
                      type="button"
                      onClick={decline}
                      className="h-[1.6rem] self-center rounded-full px-[0.5rem] text-[0.6875rem] text-ink-quiet outline-none transition-colors duration-150 hover:text-ink-soft focus-visible:text-ink focus-visible:ring-1 focus-visible:ring-white/25"
                    >
                      {INTRO_SHARE_DISMISS}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    {last ? null : (
                      <button
                        type="button"
                        onClick={() => finish()}
                        className="-ml-[0.35rem] h-[1.6rem] rounded-full px-[0.35rem] text-[0.6875rem] text-ink-quiet outline-none transition-colors duration-150 hover:text-ink-soft focus-visible:text-ink focus-visible:ring-1 focus-visible:ring-white/25"
                      >
                        Skip
                      </button>
                    )}
                    <button
                      ref={primaryRef}
                      type="button"
                      onClick={next}
                      className={cn(
                        METAL_BUTTON_CLASS,
                        "ml-auto h-[1.75rem] text-[0.6875rem] focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.232_0.009_268)]",
                        last ? "px-[0.95rem]" : "pl-[0.9rem] pr-[0.7rem]",
                      )}
                    >
                      {last ? "Done" : "Next"}
                      {last ? null : (
                        <ArrowRight aria-hidden="true" className="size-[0.75rem]" strokeWidth={2.4} />
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
