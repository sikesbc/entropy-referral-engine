import { useSyncExternalStore } from "react"

export const INTRO_STORAGE_KEY = "entropy:referrals-intro:v1"
export const REPLAY_INTRO_EVENT = "entropy:replay-intro"
export const INTRO_STEP_EVENT = "entropy:intro-step"

export type IntroStepDetail = { step: number | null; target: string | null }

export function announceIntroStep(detail: IntroStepDetail) {
  window.dispatchEvent(new CustomEvent<IntroStepDetail>(INTRO_STEP_EVENT, { detail }))
}

export type IntroPhase = "pending" | "tour" | "flying" | "rest"
export type IntroState = { phase: IntroPhase; step: number; run: number; hosts: number }

const SERVER_STATE: IntroState = { phase: "pending", step: 0, run: 0, hosts: 0 }
const listeners = new Set<() => void>()
let state: IntroState | null = null

function hasSeen(): boolean {
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === "1"
  } catch {
    return true
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "1")
  } catch {}
}

function read(): IntroState {
  if (!state) state = { phase: hasSeen() ? "rest" : "tour", step: 0, run: 0, hosts: 0 }
  return state
}

function write(next: Partial<IntroState>) {
  state = { ...read(), ...next }
  listeners.forEach((listener) => listener())
}

function onReplayEvent(event: Event) {
  const step = (event as CustomEvent<{ step?: number } | undefined>).detail?.step
  replayIntro(step)
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener(REPLAY_INTRO_EVENT, onReplayEvent)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener(REPLAY_INTRO_EVENT, onReplayEvent)
  }
}

export function useIntro(): IntroState {
  return useSyncExternalStore(subscribe, read, () => SERVER_STATE)
}

export function replayIntro(step = 0) {
  write({ phase: "tour", step: Math.max(0, Math.floor(step)), run: read().run + 1 })
}

export function setIntroStep(step: number) {
  write({ step })
}

export function launchIntro() {
  markSeen()
  write({ phase: "flying" })
}

export function landIntro() {
  write({ phase: "rest" })
}

export function hostIntro() {
  write({ hosts: read().hosts + 1 })
  return () => write({ hosts: read().hosts - 1 })
}
