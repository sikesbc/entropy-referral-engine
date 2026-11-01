import "server-only"
import { referrerMarketRate } from "@/backend/og/market-rate"
import { marketSkin } from "@/backend/og/market-skins"
import { renderTicketCard } from "@/backend/og/ticket-card"
import { lookupReferralCode } from "@/backend/site/codes"
import { displayUrl, referralUrl } from "@/lib/referral-site/config"
import { getReferrals } from "@/lib/referral-site/mock-api"
import { DEMO_ME } from "@/lib/referral-site/mock-data"
import { requestOrigin } from "@/lib/referral-site/origin"

type Referrer = { code: string; username: string; address: string; memberNumber?: number }

async function findReferrer(code: string): Promise<Referrer | null> {
  if (code.toLowerCase() === DEMO_ME.code) return DEMO_ME
  const lookup = await lookupReferralCode(code)
  if (lookup.status !== "valid") return null
  return {
    code: lookup.code,
    username: lookup.referrer.username,
    address: lookup.referrer.address,
    memberNumber: lookup.memberNumber,
  }
}

async function marketRate(referrer: Referrer, id: string) {
  if (referrer === DEMO_ME) {
    const demo = getReferrals("loaded").markets.find((market) => market.symbol === id)
    if (demo) return { state: demo.state, rate: demo.rate }
  }
  return referrerMarketRate(referrer.address, id)
}

function fileName(username: string, market: string | null): string {
  const suffix = market ? `-${market.toLowerCase()}` : ""
  return `entropy-invite-${username.replace(/[^\w-]+/g, "_")}${suffix}.png`
}

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const search = new URL(request.url).searchParams
  const referrer = await findReferrer((await context.params).code)
  if (!referrer) return new Response("Not found", { status: 404 })
  const skin = marketSkin(search.get("m"))
  const base = referralUrl(await requestOrigin(), referrer.code)
  const url = skin ? `${base}?m=${skin.id}` : base
  const market = skin ? { skin, ...(await marketRate(referrer, skin.id)) } : undefined
  const image = await renderTicketCard({
    username: referrer.username,
    memberNumber: referrer.memberNumber,
    url,
    displayUrl: displayUrl(url),
    market,
  })
  const inline = search.get("format") === "og"
  return new Response(image.body, {
    headers: {
      "content-type": "image/png",
      "content-disposition": inline
        ? "inline"
        : `attachment; filename="${fileName(referrer.username, skin?.id ?? null)}"`,
      "cache-control": skin
        ? "public, s-maxage=300, stale-while-revalidate=3600"
        : "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
