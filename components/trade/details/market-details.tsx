"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth/auth-context"
import { useMarketSnapshot } from "@/lib/trade/market-snapshot"
import { AboutPanel } from "./about-panel"
import { AccountActivityPanel } from "./account-activity-panel"
import { DetailTabs, type DetailTab } from "./detail-tabs"
import { SignedOutActivity } from "./signed-out-activity"

export function MarketDetails({ coin }: { coin: string }) {
  const [tab, setTab] = useState<DetailTab>("about")
  const { isSignedIn } = useSession()
  const market = useMarketSnapshot(coin)

  return (
    <section
      aria-label="Account activity"
      className="entropy-card rounded-[0.625rem] flex min-h-[13.75rem] flex-1 flex-col px-6 pb-3"
    >
      <DetailTabs value={tab} onChange={setTab} />
      {tab === "about" ? (
        <AboutPanel market={market} />
      ) : isSignedIn ? (
        <AccountActivityPanel tab={tab} dex={market.dex} />
      ) : (
        <SignedOutActivity />
      )}
    </section>
  )
}
