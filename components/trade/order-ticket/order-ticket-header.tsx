import type { ReactNode } from "react"
import { marketLogoSrc } from "@/lib/assets"

export function OrderTicketHeader({
  coin,
  name,
  children,
}: {
  coin: string
  name: string
  children: ReactNode
}) {
  return (
    <header className="flex h-8 items-center justify-between border-b border-line pb-1.5">
      <h2 className="flex min-w-0 items-center gap-2 text-[0.875rem] font-medium">
        <div className="flex items-center justify-center overflow-hidden font-serif bg-transparent h-5 w-5 text-[0.5625rem] shrink-0 rounded-[0.25rem]">
          <img
            alt={name}
            decoding="async"
            className="h-full w-full object-contain"
            src={marketLogoSrc(coin)}
          />
        </div>
        <span className="truncate">{name}</span>
      </h2>
      {children}
    </header>
  )
}
