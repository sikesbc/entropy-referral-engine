"use client"

import { Lock } from "lucide-react"
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { humane } from "@/components/onboarding/humane-font"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { MARKET_PASSES_CSS } from "./market-passes-css"
import { PASS_CSS } from "./pass/pass-css"
import { mainSkin, SKINS } from "./pass/skins"
import { caption, choiceName, explain, MAIN_ID, progressOf, shownRate, type PassChoice } from "./passes"

const HUMANE = { fontFamily: humane.style.fontFamily }
const MAX_TILT_DEG = 6

function stillness(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function tilt(event: ReactPointerEvent<HTMLButtonElement>) {
  const tile = event.currentTarget
  if (event.pointerType !== "mouse" || stillness()) return
  const box = tile.getBoundingClientRect()
  const x = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1) - 0.5
  const y = Math.min(Math.max((event.clientY - box.top) / box.height, 0), 1) - 0.5
  tile.style.setProperty("--ry", `${(x * MAX_TILT_DEG * 2).toFixed(2)}deg`)
  tile.style.setProperty("--rx", `${(-y * MAX_TILT_DEG * 1.4).toFixed(2)}deg`)
  tile.style.setProperty("--glow", "1")
  tile.dataset.active = "true"
  for (const face of tile.querySelectorAll<HTMLElement>(".pass-face")) {
    const rect = face.getBoundingClientRect()
    face.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`)
    face.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`)
  }
}

function untilt(event: ReactPointerEvent<HTMLButtonElement>) {
  const tile = event.currentTarget
  tile.style.setProperty("--ry", "0deg")
  tile.style.setProperty("--rx", "0deg")
  tile.style.setProperty("--glow", "0")
  tile.dataset.active = "false"
}

export function MarketPassStyles() {
  return (
    <>
      <style href="pass-styles" precedence="default">
        {PASS_CSS}
      </style>
      {[mainSkin, ...SKINS].map((skin) => (
        <style key={skin.id} href={`ticket-skin-${skin.id}`} precedence="default">
          {skin.css}
        </style>
      ))}
      <style href="market-passes-styles" precedence="default">
        {MARKET_PASSES_CSS}
      </style>
    </>
  )
}

export function MarketPass({
  choice,
  selected,
  onSelect,
  className,
}: {
  choice: PassChoice
  selected: boolean
  onSelect: (id: string) => void
  className?: string
}) {
  const { skin, market, state } = choice
  const art = skin ?? mainSkin
  const tip = explain(choice)
  const name = choiceName(choice)
  const locked = state === "locked"
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pointer = useRef("")
  const [tipOpen, setTipOpen] = useState(false)
  const [peek, setPeek] = useState(false)
  const [shownState, setShownState] = useState(state)
  const [filling, setFilling] = useState(false)
  if (shownState !== state) {
    setShownState(state)
    setFilling(shownState === "locked")
  }

  useEffect(() => {
    if (!peek) return
    const away = (event: PointerEvent) => {
      if (event.target instanceof Node && buttonRef.current?.contains(event.target)) return
      setPeek(false)
      setTipOpen(false)
    }
    document.addEventListener("pointerdown", away)
    return () => document.removeEventListener("pointerdown", away)
  }, [peek])

  const pick = () => {
    if (locked && pointer.current === "touch" && !peek) {
      setPeek(true)
      setTipOpen(true)
      return
    }
    setPeek(false)
    setTipOpen(false)
    onSelect(choice.id)
  }

  return (
    <Tooltip
      open={tipOpen}
      onOpenChange={(next, details) => {
        if (!next && locked && pointer.current === "touch" && details.reason === "trigger-press") return
        setTipOpen(next)
      }}
    >
      <TooltipTrigger
        ref={buttonRef}
        delay={500}
        render={<button type="button" />}
        aria-pressed={selected}
        aria-label={`${name} pass, ${shownRate(choice)}. ${tip}`}
        onPointerDown={(event) => {
          pointer.current = event.pointerType
        }}
        onPointerMove={tilt}
        onPointerLeave={untilt}
        onKeyDown={() => {
          pointer.current = ""
        }}
        onClick={pick}
        data-peek={peek}
        className={cn("market-mini", className)}
      >
        <span
          className="pass-card market-pass"
          data-skin={skin?.id ?? "main"}
          data-state={state}
          data-fill={filling}
          aria-hidden="true"
        >
          <span className="market-scale">
            <span className="pass-ticket">
              <span className="pass-face pass-body">
                <art.Art part="body" />
                <span className="pass-sheen" />
              </span>
              <span className="pass-face pass-stub">
                <art.Art part="stub" />
                <span className="pass-perf" />
                <span className="pass-sheen" />
              </span>
            </span>
          </span>
          <span className="market-label">
            <span className="market-body-l">
              <span className="market-head">
                <img src={skin?.logo ?? "/entropy-logo-white.svg"} alt="" className="market-logo" />
                <span className="market-name">{name}</span>
              </span>
              <span className="market-foot">
                {state === "locked" && market ? (
                  <span className="market-bar">
                    <span style={{ width: `${Math.max(progressOf(market) * 100, 2)}%` }} />
                  </span>
                ) : null}
                <span className="market-tag">{caption(choice)}</span>
              </span>
            </span>
            <span className="market-stub-l">
              {state === "locked" ? <Lock className="market-lock" strokeWidth={2.5} /> : null}
              <span className="market-rate tabular-nums" style={HUMANE}>
                {shownRate(choice)}
              </span>
            </span>
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[16rem] text-[0.75rem] leading-[1.45]">{tip}</TooltipContent>
    </Tooltip>
  )
}

export function MarketPassGrid({
  choices,
  selectedId,
  onSelect,
  className,
}: {
  choices: PassChoice[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <ul
      data-tour="markets"
      className={cn(
        "market-grid grid grid-cols-2 gap-x-3 gap-y-4 @sm:grid-cols-3 @sm:gap-x-4 @sm:gap-y-5 @xl:grid-cols-4 @3xl:grid-cols-5",
        className,
      )}
    >
      {choices.map((choice) => (
        <li
          key={choice.id}
          className={cn(
            choice.id === MAIN_ID &&
              "col-span-2 row-span-2 @sm:col-span-1 @sm:row-span-1 @xl:col-span-2 @xl:row-span-2",
          )}
        >
          <MarketPass choice={choice} selected={choice.id === selectedId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  )
}
