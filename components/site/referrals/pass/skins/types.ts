import type { ReactNode } from "react"

export type TicketState = "locked" | "unlocked" | "boosted"

export type SkinPart = "body" | "stub"

export type Skin = {
  id: string
  name: string
  logo: string
  css: string
  Art: (props: { part: SkinPart }) => ReactNode
}
