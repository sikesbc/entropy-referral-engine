import type { Metadata } from "next"
import { SignedOutFeed } from "@/components/feed/signed-out-feed"
import { SocialFeed } from "@/components/feed/social-feed"
import { getServerSession } from "@/lib/auth/server"

export const metadata: Metadata = { title: "Social | Entropy" }

export default async function FeedPage() {
  const session = await getServerSession()
  return session.status === "loggedout" ? <SignedOutFeed /> : <SocialFeed />
}
