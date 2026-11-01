"use client"

import { useEffect, useState } from "react"
import { Check, Link2 } from "lucide-react"
import { LARGE_BUTTON_CLASS } from "./referral-styles"

const COPIED_MS = 1500

export function CopyLinkButton({
  getLink,
  className = LARGE_BUTTON_CLASS,
}: {
  getLink: (() => string) | null
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    if (!getLink) return
    const link = getLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      window.prompt("Copy this", link)
    }
  }

  return (
    <button type="button" disabled={!getLink} onClick={() => void copy()} className={className}>
      <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
        {copied ? (
          <Check size="1rem" aria-hidden="true" className="text-up" />
        ) : (
          <Link2 size="1rem" aria-hidden="true" />
        )}
        {copied ? "Copied" : "Copy link"}
      </span>
    </button>
  )
}
