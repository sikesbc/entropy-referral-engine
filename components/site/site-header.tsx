import Link from "next/link"
import { HeaderHowItWorks } from "@/components/referrals/intro/header-pill"
import { WalletChip } from "./wallet-chip"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-panel px-5 sm:px-12">
      <Link href="/" aria-label="Entropy Referrals home" className="flex shrink-0 items-center gap-2.5">
        <img className="h-5 w-6 invert dark:invert-0" alt="" src="/entropy-logo-white.svg" />
        <span className="text-[0.9375rem] font-medium tracking-[-0.02em] text-ink">Referrals</span>
      </Link>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="contents max-sm:[&>button]:gap-0 max-sm:[&>button]:px-[0.4rem] max-sm:[&>button]:text-[0px]">
          <HeaderHowItWorks />
        </div>
        <WalletChip />
      </div>
    </header>
  )
}
