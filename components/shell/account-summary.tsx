"use client"

import Link from "next/link"
import { useHeaderBalances } from "@/lib/api/account"
import { HeaderStat } from "./header-stat"

export function AccountSummary() {
  const { portfolio, cash } = useHeaderBalances()
  return (
    <Link
      href="/profile"
      aria-label="Portfolio and available cash"
      className="mr-2 hidden items-center gap-4 rounded-[0.4375rem] px-2 transition-colors hover:bg-panel-2 md:flex dark:hover:bg-panel-3"
    >
      <HeaderStat label="Portfolio" value={portfolio} />
      <HeaderStat label="Cash" value={cash} className="hidden lg:flex" />
    </Link>
  )
}
