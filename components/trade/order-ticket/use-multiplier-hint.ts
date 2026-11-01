"use client"

import { useCallback, useSyncExternalStore } from "react"

const HINT_STORAGE_KEY = "entropy:simple-multiplier-hint:v1"
const HINT_EVENT = "entropy:multiplier-hint"

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(HINT_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(HINT_EVENT, onChange)
  }
}

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(HINT_STORAGE_KEY) === "1"
  } catch {
    return true
  }
}

function persistDismissed(): boolean {
  try {
    window.localStorage.setItem(HINT_STORAGE_KEY, "1")
    return true
  } catch {
    return false
  }
}

export function useMultiplierHint(): { dismissed: boolean; dismiss: () => void } {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => false)
  const dismiss = useCallback(() => {
    persistDismissed()
    window.dispatchEvent(new Event(HINT_EVENT))
  }, [])
  return { dismissed, dismiss }
}
