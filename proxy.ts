import { NextResponse, type NextRequest } from "next/server"
import { appModeEnabled } from "@/lib/app-mode"

const CLONE_PREFIXES = [
  "/trade",
  "/markets",
  "/feed",
  "/profile",
  "/entropy-referrals",
  "/api/account",
  "/api/auth",
  "/api/compliance",
  "/api/copytrade",
  "/api/discovery",
  "/api/geo",
  "/api/hyperliquid",
  "/api/markets",
  "/api/me",
  "/api/referrals",
  "/api/trading",
  "/api/wallet-profiles",
]

const ALLOWED_GEO_STATUS = { restricted: false, country: "US", mode: "trading", reason: null }

function siteOnly(pathname: string): NextResponse {
  const hidden = CLONE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  return hidden ? new NextResponse("Not found", { status: 404 }) : NextResponse.next()
}

function redirectTo(request: NextRequest, pathname: string, code?: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  if (code) url.searchParams.set("r", code)
  return NextResponse.redirect(url)
}

function appMode(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  if (pathname === "/") return redirectTo(request, "/trade")
  if (pathname === "/referrals" || pathname.startsWith("/referrals/"))
    return redirectTo(request, "/entropy-referrals")
  const invite = /^\/r\/([^/]+)\/?$/.exec(pathname)
  if (invite) return redirectTo(request, "/trade", decodeURIComponent(invite[1]))
  if (pathname === "/api/geo/status") return NextResponse.json(ALLOWED_GEO_STATUS)
  return NextResponse.next()
}

export function proxy(request: NextRequest) {
  if (process.env.SITE_ONLY === "1") return siteOnly(request.nextUrl.pathname)
  if (appModeEnabled()) return appMode(request)
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/r/:path*",
    "/referrals/:path*",
    "/trade/:path*",
    "/markets/:path*",
    "/feed/:path*",
    "/profile/:path*",
    "/entropy-referrals/:path*",
    "/api/:path*",
  ],
}
