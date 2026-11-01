import Link from "next/link"
import { HeaderActions } from "./header-actions"
import { Nav } from "./nav"
import { SearchMarkets } from "./search-markets"

export function Header() {
  return (
    <header className="p-[0.1875rem]">
      <div className="relative flex min-h-11 items-center gap-2 rounded-[0.625rem] bg-panel px-3 py-1.5 text-[0.8125rem] shadow-[var(--shadow)]">
        <Link aria-label="Entropy" className="flex shrink-0 items-center gap-2 font-medium" href="/trade">
          <img className="h-5 w-6 dark:invert-0 invert" alt="" src="/entropy-logo-white.svg" />
        </Link>
        <div className="ml-1 hidden sm:block">
          <SearchMarkets />
        </div>
        <Nav />
        <HeaderActions />
      </div>
    </header>
  )
}
