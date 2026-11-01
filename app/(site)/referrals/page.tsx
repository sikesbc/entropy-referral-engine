import { ReferralsScreen } from "@/components/site/referrals-screen"
import { referralsDemo } from "@/lib/referral-site/demo"
import { requestOrigin } from "@/lib/referral-site/origin"

export default async function ReferralsPage({ searchParams }: PageProps<"/referrals">) {
  const demo = referralsDemo((await searchParams).demo)
  const origin = await requestOrigin()
  return <ReferralsScreen origin={origin} demo={demo} />
}
