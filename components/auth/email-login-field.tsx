"use client"

import { Mail } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { PRIVY_BORDER, PRIVY_ICON_MUTED, PRIVY_MUTED_TEXT, PRIVY_TEXT } from "./privy-styles"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailLoginField({
  defaultEmail,
  submitting,
  onSubmit,
}: {
  defaultEmail: string
  submitting: boolean
  onSubmit: (email: string) => void
}) {
  const [email, setEmail] = useState(defaultEmail)
  const valid = EMAIL_PATTERN.test(email.trim())
  const disabled = submitting || !valid

  const submit = () => {
    if (!disabled) onSubmit(email.trim())
  }

  return (
    <label className="relative block h-[56px] w-full">
      <span
        className={cn(
          "absolute top-1/2 left-[11px] flex size-[32px] -translate-y-1/2 items-center justify-center",
          PRIVY_ICON_MUTED,
        )}
      >
        <Mail size={22} strokeWidth={2} aria-hidden="true" />
      </span>
      <input
        id="email-input"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        aria-label="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit()
        }}
        className={cn(
          "block h-[56px] w-full overflow-hidden rounded-[12px] border bg-transparent py-[12px] pr-[88px] pl-[52px] text-[16px] leading-[24px] text-ellipsis whitespace-nowrap outline-none placeholder:text-[#9ca3af] focus:border-black/[0.28] dark:focus:border-white/[0.24]",
          PRIVY_BORDER,
          PRIVY_TEXT,
        )}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={submit}
        className={cn(
          "absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer px-[17px] py-[13px] text-[14px] leading-[24px] font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-40",
          disabled ? PRIVY_MUTED_TEXT : PRIVY_TEXT,
        )}
      >
        {submitting ? "Sending" : "Submit"}
      </button>
    </label>
  )
}
