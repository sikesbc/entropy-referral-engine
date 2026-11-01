"use client"

import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { useSiteWallet } from "@/lib/referral-site/wallet"
import { PRIMARY_BUTTON_CLASS, SMALL_BUTTON_CLASS } from "./site-styles"

export function ConnectWalletButton({ size = "small" }: { size?: "small" | "large" }) {
  const wallet = useSiteWallet()
  const [pending, setPending] = useState(false)

  const connect = async () => {
    if (pending) return
    setPending(true)
    try {
      await wallet.connect()
    } catch {
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      aria-busy={pending || undefined}
      onClick={() => void connect()}
      className={size === "large" ? PRIMARY_BUTTON_CLASS : SMALL_BUTTON_CLASS}
    >
      {pending ? <LoaderCircle aria-hidden="true" className="size-[1em] animate-spin" /> : null}
      {pending ? "Connecting…" : "Connect wallet"}
    </button>
  )
}
