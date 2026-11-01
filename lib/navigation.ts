export type NavItem = {
  href: string
  label: string
  desktopOnly: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/trade", label: "Trade", desktopOnly: false },
  { href: "/markets", label: "Markets", desktopOnly: false },
  { href: "/feed", label: "Social", desktopOnly: false },
  { href: "/profile", label: "Portfolio", desktopOnly: true },
  { href: "/entropy-referrals", label: "Referrals", desktopOnly: true },
]

const NON_TRADE_ROUTES = ["/markets", "/feed", "/profile", "/entropy-referrals"]

export function isTradeRoute(pathname: string): boolean {
  return !NON_TRADE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/trade") return isTradeRoute(pathname)
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function isViewportLockedRoute(pathname: string): boolean {
  return isTradeRoute(pathname) || pathname === "/feed"
}
