import { lookupReferralCode } from "@/backend/site/codes"
import { OG_SIZE, renderInviteCard } from "@/backend/og/invite-card"
import { renderTicketCard } from "@/backend/og/ticket-card"
import { normalizeCode } from "@/lib/referral-site/code"
import { displayUrl, referralUrl } from "@/lib/referral-site/config"
import { DEMO_ME } from "@/lib/referral-site/mock-data"

export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "Invitation to Entropy"
export const revalidate = 86400

function siteOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").origin
}

async function findReferrer(code: string) {
  if (normalizeCode(code) === DEMO_ME.code) return DEMO_ME
  const lookup = await lookupReferralCode(code)
  if (lookup.status !== "valid") return null
  return { code: lookup.code, username: lookup.referrer.username, memberNumber: lookup.memberNumber }
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const referrer = await findReferrer((await params).code)
  if (!referrer) {
    return renderInviteCard({
      headline: "Welcome to Entropy",
      subline: "Connect your Hyperliquid wallet to get your referral link.",
      footer: new URL(siteOrigin()).host,
    })
  }
  const url = referralUrl(siteOrigin(), referrer.code)
  return renderTicketCard({
    username: referrer.username,
    memberNumber: referrer.memberNumber,
    url,
    displayUrl: displayUrl(url),
  })
}
