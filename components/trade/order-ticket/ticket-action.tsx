"use client"

import type { CSSProperties } from "react"

type TicketActionProps = {
  label: string
  onClick: (() => void) | null
}

const ringStyle = { "--liquid-metal-ring-width": "1.5px" } as CSSProperties

export function TicketAction({ label, onClick }: TicketActionProps) {
  const disabled = onClick === null
  return (
    <div
      className="liquid-metal-button h-14 shrink-0 rounded-[1rem] bg-black/10 dark:bg-white/[0.16]"
      data-disabled={disabled ? "true" : "false"}
      style={ringStyle}
    >
      <button
        type="button"
        disabled={disabled}
        data-tour="ticket-action"
        onClick={onClick ?? undefined}
        className="block h-full w-full rounded-[calc(1rem-1.5px)] bg-panel-2 font-sans text-[1.0625rem] font-medium leading-[1.375rem] tracking-[-0.018em] text-ink transition-transform duration-150 enabled:active:scale-[0.98] disabled:text-ink-quiet dark:bg-panel-3"
      >
        {label}
      </button>
    </div>
  )
}
