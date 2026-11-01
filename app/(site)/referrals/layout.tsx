import type { ReactNode } from "react"
import { SiteHeader } from "@/components/site/site-header"

export default function ReferralsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="entropy-trade flex min-h-dvh flex-col bg-panel text-ink">
      <SiteHeader />
      {children}
    </div>
  )
}
