"use client"

import { useState, type CSSProperties, type ReactNode } from "react"
import { ResizeHandle } from "./resize-handle"

const TICKET_WIDTH = { initial: 425, min: 350, max: 650 }
const TOP_ROW = { initial: 585, min: 200, max: 900 }

type TradeLayoutProps = { market: ReactNode; details: ReactNode; ticket: ReactNode }

export function TradeLayout({ market, details, ticket }: TradeLayoutProps) {
  const [ticketWidth, setTicketWidth] = useState(TICKET_WIDTH.initial)
  const [topRow, setTopRow] = useState(TOP_ROW.initial)
  const style = { "--ticket-width": `${ticketWidth}px`, "--top-row": `${topRow}px` } as CSSProperties

  return (
    <main
      className="flex flex-1 flex-col gap-[0.1875rem] px-[0.1875rem] pb-[0.1875rem] lg:grid lg:min-h-0 lg:gap-0 lg:grid-cols-[minmax(0,1fr)_0.1875rem_var(--ticket-width)] lg:grid-rows-[minmax(0,1fr)]"
      style={style}
    >
      <div className="contents lg:col-start-1 lg:row-start-1 lg:flex lg:min-h-0 lg:min-w-0 lg:flex-col lg:overflow-y-auto lg:overscroll-contain lg:rounded-[0.625rem] lg:[scrollbar-width:none]">
        {market}
        <ResizeHandle
          label="Resize chart height"
          orientation="horizontal"
          value={topRow}
          min={TOP_ROW.min}
          max={TOP_ROW.max}
          onChange={setTopRow}
          className="cursor-row-resize h-[0.1875rem] shrink-0"
        />
        <div className="flex min-w-0 flex-col max-lg:order-3 lg:shrink-0 lg:grow">{details}</div>
      </div>
      <ResizeHandle
        label="Resize order panel"
        orientation="vertical"
        value={ticketWidth}
        min={TICKET_WIDTH.min}
        max={TICKET_WIDTH.max}
        invert
        onChange={setTicketWidth}
        className="cursor-col-resize lg:col-start-2 lg:row-start-1"
      />
      <aside className="flex min-w-0 flex-col gap-[0.1875rem] max-lg:order-2 lg:col-start-3 lg:row-start-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:none] [&>*]:shrink-0 lg:[&>[data-trade-order-panel]]:grow">
        {ticket}
      </aside>
    </main>
  )
}
