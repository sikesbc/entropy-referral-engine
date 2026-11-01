"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ReferralsResponse } from "@/lib/referral-site/types"
import { Earnings } from "./earnings"
import { Friends, OPEN_SHARE_EVENT } from "./friends"
import { MarketPassGrid, MarketPassStyles } from "./market-passes"
import { Pass } from "./pass/pass"
import { buildChoices, cutNote, lockOf, MAIN_ID, type PassChoice } from "./passes"

type Me = {
  url: string
  code: string
  username: string
  address: string
  memberNumber?: number
}

function Hero({ me, choice }: { me: Me; choice: PassChoice }) {
  const url = choice.skin ? `${me.url}?m=${choice.skin.id}` : me.url
  return (
    <div className="market-hero relative z-10">
      <div key={choice.id} data-tour="ticket">
        <Pass
          share="below"
          username={me.username}
          url={url}
          code={me.code}
          address={me.address}
          referrerShare={choice.rate}
          cutNote={cutNote(choice)}
          memberNumber={me.memberNumber}
          market={choice.skin?.id}
          state={choice.state}
          lock={lockOf(choice)}
        />
      </div>
    </div>
  )
}

function useShareFallback(choice: PassChoice, select: (id: string) => void) {
  const pending = useRef(false)
  const locked = choice.state === "locked"
  useEffect(() => {
    if (!locked) return
    const reroute = () => {
      pending.current = true
      select(MAIN_ID)
    }
    window.addEventListener(OPEN_SHARE_EVENT, reroute)
    return () => window.removeEventListener(OPEN_SHARE_EVENT, reroute)
  }, [locked, select])
  useEffect(() => {
    if (locked || !pending.current) return
    pending.current = false
    window.dispatchEvent(new CustomEvent(OPEN_SHARE_EVENT))
  }, [locked, choice.id])
}

export function ReferralsView({ me, data }: { me: Me; data: ReferralsResponse }) {
  const choices = useMemo(() => buildChoices(data.markets, data.rates.referrerShare), [data])
  const [selectedId, setSelectedId] = useState(MAIN_ID)
  const choice = choices.find((candidate) => candidate.id === selectedId) ?? choices[0]
  const showPass = (id: string) => {
    setSelectedId(id)
    document.querySelector('[data-tour="ticket"]')?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }
  useShareFallback(choice, setSelectedId)

  return (
    <main className="mx-auto w-full max-w-[80rem] px-5 pb-28 pt-8 sm:px-12 sm:pt-14">
      <MarketPassStyles />
      <div className="grid grid-cols-1 gap-y-12 xl:grid-cols-[minmax(37rem,42rem)_minmax(18rem,1fr)] xl:grid-rows-[auto_auto] xl:items-start xl:gap-x-[3rem] xl:gap-y-14 2xl:gap-x-[5rem]">
        <div className="w-full min-w-0 max-w-[42rem] xl:col-start-1 xl:row-start-1">
          <Hero me={me} choice={choice} />
        </div>
        <div className="min-w-0 xl:col-start-2 xl:row-start-1">
          <Earnings data={data} onSelect={showPass} />
        </div>
        <div className="@container min-w-0 xl:col-start-1 xl:row-start-2">
          <MarketPassGrid choices={choices} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="min-w-0 xl:col-start-2 xl:row-start-2">
          <Friends traders={data.referrals} />
        </div>
      </div>
    </main>
  )
}
