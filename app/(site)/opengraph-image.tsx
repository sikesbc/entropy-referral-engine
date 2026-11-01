import { OG_SIZE, renderInviteCard } from "@/backend/og/invite-card"

export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "Entropy referrals"

export default async function Image() {
  return renderInviteCard({
    headline: "Welcome to Entropy",
    subline: "Get a link. Earn half of what Entropy makes in fees on your friends' io trades.",
    footer: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").host,
  })
}
