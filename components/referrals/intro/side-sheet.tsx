"use client"

import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

const SURFACE = "oklch(0.232 0.009 268)"

const SHEET_STYLE: CSSProperties = {
  background: [
    "radial-gradient(120% 40% at 0% 0%, rgb(255 255 255 / 0.05), transparent 60%)",
    "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.006) 0 1px, transparent 1px 3px)",
    `linear-gradient(${SURFACE}, ${SURFACE})`,
  ].join(", "),
  boxShadow: "-1px 0 0 rgb(4 5 8 / 0.7), -28px 0 64px -20px rgb(4 5 8 / 0.9)",
}

export function SideSheet({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-[80] bg-[rgb(5_6_9/0.6)] transition-opacity duration-300 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <Dialog.Popup
        style={SHEET_STYLE}
        className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-[23rem] flex-col text-ink outline-none transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] data-ending-style:translate-x-full data-ending-style:duration-300 data-starting-style:translate-x-full motion-reduce:data-ending-style:translate-x-0 motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:translate-x-0 motion-reduce:data-starting-style:opacity-0"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,rgb(255_255_255/0.34),rgb(255_255_255/0.1)_24%,rgb(255_255_255/0.06)_62%,rgb(214_220_255/0.2))]"
        />
        <div className="flex items-center justify-between gap-4 px-[1.4rem] pb-[0.5rem] pt-[1.35rem]">
          <Dialog.Title className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="-mr-[0.35rem] inline-flex size-[1.6rem] items-center justify-center rounded-full text-ink-quiet outline-none transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink focus-visible:bg-white/[0.08] focus-visible:text-ink"
          >
            <X aria-hidden="true" className="size-[0.9rem]" />
          </Dialog.Close>
        </div>
        {description ? (
          <Dialog.Description className="px-[1.4rem] text-[0.8125rem] leading-[1.5] text-ink-quiet">
            {description}
          </Dialog.Description>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[1.4rem] pb-[2.4rem] pt-[1.7rem] [mask-image:linear-gradient(to_bottom,transparent,#000_1.2rem)]">
          {children}
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  )
}
