"use client"

import { lazy, Suspense, useEffect, useState } from "react"
import { hostIntro, useIntro } from "./intro-store"
import type { IntroStep } from "./intro-tour-layer"

export type { IntroStep } from "./intro-tour-layer"

const loadLayer = () => import("./intro-tour-layer")

const TourLayer = lazy(() => loadLayer().then((module) => ({ default: module.TourLayer })))

export function preloadIntroTour() {
  void loadLayer()
}

function found(selector: string) {
  return document.querySelector(selector) !== null
}

function resolve(step: IntroStep): IntroStep | null {
  if (step.when && !found(step.when)) return null
  if (found(step.target)) return step
  if (step.fallback && found(step.fallback)) return { ...step, target: step.fallback }
  return step.floating ? step : null
}

function presentSteps(steps: IntroStep[]): IntroStep[] {
  const filled = new Set<string>()
  const kept = steps.flatMap((step) => {
    const resolved = resolve(step)
    if (!resolved) return []
    if (!step.slot) return [resolved]
    if (filled.has(step.slot)) return []
    filled.add(step.slot)
    return [resolved]
  })
  return kept.some((step) => found(step.target)) ? kept : []
}

function usePresentSteps(steps: IntroStep[], active: boolean, run: number): IntroStep[] | null {
  const [found, setFound] = useState<{ run: number; steps: IntroStep[] } | null>(null)
  useEffect(() => {
    if (!active) return
    const id = requestAnimationFrame(() => setFound({ run, steps: presentSteps(steps) }))
    return () => cancelAnimationFrame(id)
  }, [steps, active, run])
  return found && found.run === run ? found.steps : null
}

export function IntroTour({ steps, pillTarget }: { steps: IntroStep[]; pillTarget: string }) {
  const intro = useIntro()
  const active = intro.phase === "tour" || intro.phase === "flying"
  const present = usePresentSteps(steps, active, intro.run)
  const empty = present !== null && present.length === 0

  useEffect(() => {
    if (active) preloadIntroTour()
  }, [active])

  useEffect(() => {
    if (empty) return
    return hostIntro()
  }, [empty])

  if (!active || !present || present.length === 0) return null
  return (
    <Suspense fallback={null}>
      <TourLayer key={intro.run} steps={present} pillTarget={pillTarget} startAt={intro.step} />
    </Suspense>
  )
}
