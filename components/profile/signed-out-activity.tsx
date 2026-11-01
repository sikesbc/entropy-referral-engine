"use client"

import { useState } from "react"
import { useLoginModal } from "@/components/auth/login-modal-context"
import { ActivityTabIcon, ACTIVITY_TAB_LABELS, type ActivityTabValue } from "./activity-tab-icons"
import { ActivityTabs, type ActivityTab } from "./activity-tabs"
import { CARD_CLASS, SECONDARY_BUTTON_CLASS } from "./profile-styles"

const TAB_ORDER: ActivityTabValue[] = ["positions", "orders", "history"]

export function SignedOutActivity() {
  const { openLogin } = useLoginModal()
  const [tab, setTab] = useState<ActivityTabValue>("positions")
  const tabs: ActivityTab<ActivityTabValue>[] = TAB_ORDER.map((value) => ({
    value,
    label: ACTIVITY_TAB_LABELS[value],
    icon: <ActivityTabIcon tab={value} />,
  }))

  return (
    <section
      aria-label="Account activity"
      className={`${CARD_CLASS} flex min-h-[13.75rem] flex-1 flex-col px-6 pb-3`}
    >
      <ActivityTabs tabs={tabs} value={tab} onChange={setTab} />
      <div className="flex flex-col items-center gap-3 py-10">
        <p className="text-[0.8125rem] text-ink-quiet">Your trades will appear here.</p>
        <button className={SECONDARY_BUTTON_CLASS} onClick={() => openLogin()}>
          Login
        </button>
      </div>
    </section>
  )
}
