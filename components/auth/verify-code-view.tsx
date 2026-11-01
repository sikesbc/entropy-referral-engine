"use client"

import { Mail } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { PRIVY_ICON_MUTED, PRIVY_MUTED_TEXT, PRIVY_TEXT, PRIVY_TITLE_CLASS } from "./privy-styles"
import { CODE_LENGTH, VerificationCodeInput } from "./verification-code-input"

type ResendState = "idle" | "sending" | "sent"

const EMPTY_CODE = Array.from({ length: CODE_LENGTH }, () => "")

export function VerifyCodeView({
  email,
  onVerify,
  onResend,
}: {
  email: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
}) {
  const [digits, setDigits] = useState<string[]>(EMPTY_CODE)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resend, setResend] = useState<ResendState>("idle")

  const change = (next: string[]) => {
    setDigits(next)
    setError(null)
    const code = next.join("")
    if (code.length !== CODE_LENGTH || verifying) return
    setVerifying(true)
    onVerify(code).catch(() => {
      setError("Invalid or expired verification code")
      setDigits(EMPTY_CODE)
      setVerifying(false)
    })
  }

  const resendCode = () => {
    if (resend === "sending") return
    setResend("sending")
    onResend()
      .then(() => setResend("sent"))
      .catch(() => setResend("idle"))
  }

  return (
    <div className="flex flex-col items-center">
      <span className={cn("mt-[14px] flex size-[32px] items-center justify-center", PRIVY_ICON_MUTED)}>
        <Mail size={32} strokeWidth={2} aria-hidden="true" />
      </span>
      <h3 id="privy-dialog-title" className={cn(PRIVY_TITLE_CLASS, "mt-[34px]")}>
        Enter confirmation code
      </h3>
      <p className={cn("m-0 mt-[4px] px-[24px] text-center text-[14px] leading-[20px]", PRIVY_MUTED_TEXT)}>
        Please check <span className={cn("font-medium break-all", PRIVY_TEXT)}>{email}</span> for an email
        from privy.io and enter your code below.
      </p>
      <div className="mt-[24px] w-full px-[24px]">
        <VerificationCodeInput
          digits={digits}
          disabled={verifying}
          invalid={error !== null}
          onChange={change}
        />
      </div>
      <p
        role={error ? "alert" : undefined}
        className={cn(
          "m-0 mt-[12px] min-h-[20px] text-center text-[13px] leading-[20px]",
          error ? "text-[#ef4444]" : PRIVY_MUTED_TEXT,
        )}
      >
        {error ?? (verifying ? "Verifying…" : "")}
      </p>
      <p className={cn("m-0 mt-[12px] text-center text-[14px] leading-[20px]", PRIVY_MUTED_TEXT)}>
        {resend === "sent" ? (
          "Code sent"
        ) : (
          <>
            Didn&apos;t get an email?{" "}
            <button
              type="button"
              onClick={resendCode}
              disabled={resend === "sending" || verifying}
              className={cn(
                "cursor-pointer font-medium underline-offset-2 hover:underline disabled:opacity-60",
                PRIVY_TEXT,
              )}
            >
              {resend === "sending" ? "Sending…" : "Resend code"}
            </button>
          </>
        )}
      </p>
    </div>
  )
}
