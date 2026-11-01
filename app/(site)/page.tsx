import { SignupScreen } from "@/components/site/signup-screen"
import { signupDemo } from "@/lib/referral-site/demo"
import { DEMO_UNKNOWN_CODE } from "@/lib/referral-site/mock-data"
import { requestOrigin } from "@/lib/referral-site/origin"

export default async function SignupPage({ searchParams }: PageProps<"/">) {
  const demo = signupDemo((await searchParams).demo)
  const origin = await requestOrigin()
  return (
    <SignupScreen
      invite={null}
      initialCode={demo === "invalid" ? DEMO_UNKNOWN_CODE : ""}
      demo={demo}
      origin={origin}
    />
  )
}
