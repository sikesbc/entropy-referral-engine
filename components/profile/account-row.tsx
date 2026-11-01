import type { ReactNode } from "react"

export function AccountRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex h-[3.125rem] items-center justify-between border-b border-line-soft font-sans text-[0.875rem] leading-[1.125rem] text-ink-soft last:border-b-0">
      <span>{label}</span>
      {children}
    </div>
  )
}
