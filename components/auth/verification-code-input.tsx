"use client"

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { PRIVY_BORDER, PRIVY_TEXT } from "./privy-styles"

export const CODE_LENGTH = 6

export function VerificationCodeInput({
  digits,
  disabled,
  invalid,
  onChange,
}: {
  digits: string[]
  disabled: boolean
  invalid: boolean
  onChange: (digits: string[]) => void
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const focusAt = (index: number) => {
    const target = inputs.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]
    target?.focus()
    target?.select()
  }

  const fill = (start: number, text: string) => {
    const incoming = text
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH - start)
      .split("")
    if (incoming.length === 0) return
    const next = [...digits]
    incoming.forEach((digit, offset) => {
      next[start + offset] = digit
    })
    onChange(next)
    focusAt(start + incoming.length)
  }

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault()
      const next = [...digits]
      next[index - 1] = ""
      onChange(next)
      focusAt(index - 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      focusAt(index - 1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    fill(index, event.clipboardData.getData("text"))
  }

  return (
    <div role="group" aria-label="Verification code" className="flex w-full justify-between gap-[7px]">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node
          }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={CODE_LENGTH}
          autoFocus={index === 0}
          aria-label={`Digit ${index + 1}`}
          onFocus={(event) => event.target.select()}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "")
            if (!value) {
              const next = [...digits]
              next[index] = ""
              onChange(next)
              return
            }
            const typed = digit && value.length === 2 ? value.replace(digit, "") || digit : value
            fill(index, typed)
          }}
          className={cn(
            "h-[56px] w-[46px] min-w-0 rounded-[12px] border bg-transparent text-center text-[20px] leading-[32px] font-medium outline-none focus:border-black/[0.28] disabled:opacity-60 dark:focus:border-white/[0.24]",
            invalid ? "border-[#ef4444]" : PRIVY_BORDER,
            PRIVY_TEXT,
          )}
        />
      ))}
    </div>
  )
}
