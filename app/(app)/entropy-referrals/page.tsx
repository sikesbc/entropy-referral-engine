import { ReferralsDashboard } from "@/components/referrals/referrals-dashboard"
import { ReferralsLoginPrompt } from "@/components/referrals/referrals-login-prompt"
import { SiteReferralsDashboard } from "@/components/referrals/site-referrals-dashboard"
import { getServerSession } from "@/lib/auth/server"

export default async function ReferralsPage() {
  if (process.env.NEXT_PUBLIC_APP_MODE === "1") return <SiteReferralsDashboard />
  const session = await getServerSession()
  return session.status === "loggedout" ? <ReferralsLoginPrompt /> : <ReferralsDashboard />
}
