"use client"

import { usePathname } from "next/navigation"
import { HowItWorksPill } from "./how-it-works"

export const HEADER_PILL_TARGET = '[data-tour="how-pill"]'

export function HeaderHowItWorks() {
  const pathname = usePathname()
  if (pathname !== "/referrals") return null
  return <HowItWorksPill data-tour="how-pill" />
}
