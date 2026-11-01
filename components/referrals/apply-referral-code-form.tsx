"use client"

import { useState, type FormEvent } from "react"
import { useApplyReferralCode } from "@/lib/api/referrals"
import { SMALL_BUTTON_CLASS } from "./referral-styles"

export function ApplyReferralCodeForm({ onError }: { onError: (message: string | null) => void }) {
  const [code, setCode] = useState("")
  const apply = useApplyReferralCode()
  const trimmed = code.trim()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmed || apply.isPending) return
    onError(null)
    try {
      const result = await apply.mutateAsync(trimmed)
      if (result.status === "rejected") {
        onError(result.message)
        return
      }
      setCode("")
    } catch {
      onError("Couldn’t apply that code.")
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex w-full items-center gap-2.5">
      <span className="whitespace-nowrap font-sans text-[0.875rem] text-ink-soft">Got a referral code?</span>
      <input
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="Referral code"
        aria-label="Referral code"
        autoComplete="off"
        spellCheck={false}
        maxLength={64}
        className="h-8 min-w-0 flex-1 rounded-[0.4375rem] bg-panel-2 px-2.5 font-sans text-[0.8125rem] text-ink outline-none ring-1 ring-inset ring-transparent placeholder:text-ink-ghost focus:ring-ink/30 dark:bg-panel-3"
      />
      <button type="submit" disabled={!trimmed || apply.isPending} className={SMALL_BUTTON_CLASS}>
        {apply.isPending ? "Applying…" : "Apply"}
      </button>
    </form>
  )
}
