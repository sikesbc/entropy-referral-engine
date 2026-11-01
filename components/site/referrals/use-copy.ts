"use client"

import { useCallback, useEffect, useState } from "react"

const COPIED_MS = 1600

function writeClipboard(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return Promise.reject(new Error("clipboard"))
  return navigator.clipboard.writeText(text)
}

export function useCopy() {
  const [count, setCount] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(id)
  }, [copied, count])

  const copy = useCallback((text: string) => {
    setCopied(true)
    setCount((value) => value + 1)
    writeClipboard(text).catch(() => {
      setCopied(false)
      window.prompt("Copy this", text)
    })
  }, [])

  return { copied, count, copy }
}
