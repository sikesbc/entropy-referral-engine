import { SignedInProfile } from "@/components/profile/signed-in-profile"
import { SignedOutActivity } from "@/components/profile/signed-out-activity"
import { SignedOutPortfolioCard } from "@/components/profile/signed-out-portfolio-card"
import { PROFILE_MAIN_CLASS } from "@/components/profile/profile-styles"
import { getServerSession } from "@/lib/auth/server"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Profile | Entropy" }

export default async function ProfilePage() {
  const session = await getServerSession()

  if (session.status === "loggedout") {
    return (
      <main className={PROFILE_MAIN_CLASS}>
        <SignedOutPortfolioCard />
        <SignedOutActivity />
      </main>
    )
  }

  return <SignedInProfile />
}
