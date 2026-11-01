import { ReferralsDashboard } from "@/components/referrals/referrals-dashboard"
import { ReferralsLoginPrompt } from "@/components/referrals/referrals-login-prompt"
import { ReferralsScreen } from "@/components/site/referrals-screen"
import { getServerSession } from "@/lib/auth/server"
import { referralsDemo } from "@/lib/referral-site/demo"
import { requestOrigin } from "@/lib/referral-site/origin"

export default async function ReferralsPage({ searchParams }: PageProps<"/entropy-referrals">) {
  if (process.env.NEXT_PUBLIC_APP_MODE === "1") {
    const demo = referralsDemo((await searchParams).demo)
    return <ReferralsScreen origin={await requestOrigin()} demo={demo} signedOut={<ReferralsLoginPrompt />} />
  }
  const session = await getServerSession()
  return session.status === "loggedout" ? <ReferralsLoginPrompt /> : <ReferralsDashboard />
}
