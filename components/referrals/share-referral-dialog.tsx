"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import type { ReferralTier } from "@/lib/api/types/referrals"
import { cn } from "@/lib/utils"
import { EMPTY_VALUE, formatRate } from "./referral-format"

const HEADER_HEIGHT = 56
const FOOTER_HEIGHT = 148
const COPIED_MS = 1800

const notch = (x: string) =>
  `radial-gradient(circle 11px at ${x} ${HEADER_HEIGHT}px, transparent 10.5px, #000 11px)`
const NOTCHED_MASK = [notch("0px"), notch("100%")].join(", ")

const TICKET_STYLE: CSSProperties = {
  WebkitMaskImage: NOTCHED_MASK,
  maskImage: NOTCHED_MASK,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
}

const LOGO_MASK_STYLE: CSSProperties = {
  WebkitMaskImage: "url(/entropy-logo-white.svg)",
  maskImage: "url(/entropy-logo-white.svg)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskPosition: "center",
  maskPosition: "center",
}

function TierRate({
  label,
  rate,
  className,
}: {
  label: string
  rate: number | undefined
  className?: string
}) {
  return (
    <div className={className}>
      <div className="inline-block text-left">
        <p className="whitespace-nowrap text-[10px] tracking-[0.04em] text-white/45">{label}</p>
        <p className="mt-1 whitespace-nowrap font-mono text-[15px] font-bold">
          {rate == null ? EMPTY_VALUE : formatRate(rate)}
        </p>
      </div>
    </div>
  )
}

export function ShareReferralDialog({
  open,
  onOpenChange,
  username,
  link,
  tier,
  maxSortOrder,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  link: string | null
  tier: ReferralTier | null
  maxSortOrder: number | null
}) {
  const [copied, setCopied] = useState(false)
  const maxed = tier !== null && maxSortOrder !== null && tier.sortOrder >= maxSortOrder

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/65 backdrop-blur-md" />
        <DialogPrimitive.Popup
          aria-label="Your Entropy tier"
          className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[390px] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 outline-none"
        >
          <section
            className="relative w-full overflow-hidden rounded-[20px] bg-[#0f0f10] text-[#f4f4f5]"
            style={TICKET_STYLE}
          >
            <div
              className="relative z-10 flex items-center justify-center gap-2"
              style={{ height: HEADER_HEIGHT }}
            >
              <span aria-hidden="true" className="h-[16px] w-[26px] bg-[#f4f4f5]" style={LOGO_MASK_STYLE} />
              <span className="text-[13px] font-semibold tracking-[0.1em]">ENTROPY</span>
            </div>
            <div className="relative z-10 px-6 pb-2 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <WalletAvatar seed={username} size={42} title={username} />
                  <DialogPrimitive.Title className="min-w-0 truncate text-[22px] font-bold">
                    {username}
                  </DialogPrimitive.Title>
                </div>
                {tier ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0f0f10]",
                      maxed ? "bg-[#e5bc58]" : "bg-[#b7a4f0]",
                    )}
                  >
                    {tier.displayName}
                  </span>
                ) : null}
              </div>
              <div className="mt-7 grid grid-cols-3">
                <TierRate label="Rebate" rate={tier?.ownTradeRebateRate} />
                <TierRate
                  label="Referral Bonus"
                  rate={tier?.referredUserBenefitRate}
                  className="text-center"
                />
                <TierRate label="Commission" rate={tier?.directReferrerRate} className="text-right" />
              </div>
            </div>
            <div
              className="relative z-10 flex items-center justify-center px-6"
              style={{ height: FOOTER_HEIGHT }}
            >
              <p className="max-w-full break-all text-center font-mono text-[13px] text-white/60">
                {link ?? EMPTY_VALUE}
              </p>
            </div>
          </section>
          {link ? (
            <button
              type="button"
              onClick={() => void copy()}
              className="w-full rounded-[8px] bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/[0.14] hover:text-white"
            >
              {copied ? "Referral link copied" : "Copy referral link"}
            </button>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
