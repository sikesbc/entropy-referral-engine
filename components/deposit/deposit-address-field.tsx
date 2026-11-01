"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

const COPIED_MS = 1500

export function DepositAddressField({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = () => {
    void navigator.clipboard
      ?.writeText(address)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }

  return (
    <div className="flex items-center gap-2 rounded-[0.5rem] bg-panel-2 py-2 pl-3 pr-2 dark:bg-panel-3">
      <span className="min-w-0 flex-1 break-all font-mono text-[0.75rem] leading-[1.4] text-ink">
        {address}
      </span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[0.375rem] bg-panel px-2 text-[0.75rem] font-medium text-ink-soft transition-colors hover:text-ink"
      >
        {copied ? <Check size="0.75rem" aria-hidden="true" /> : <Copy size="0.75rem" aria-hidden="true" />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  )
}
