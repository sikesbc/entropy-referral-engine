import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cache } from "react"
import { SignupScreen } from "@/components/site/signup-screen"
import { marketSkin } from "@/backend/og/market-skins"
import { signupDemo } from "@/lib/referral-site/demo"
import { lookupReferralCode as lookupReferralCodeUncached } from "@/backend/site/codes"
import { normalizeCode } from "@/lib/referral-site/code"
import { lookupCode as lookupDemoCode } from "@/lib/referral-site/mock-api"
import { DEMO_ME } from "@/lib/referral-site/mock-data"
import { requestOrigin } from "@/lib/referral-site/origin"
import type { CodeLookup } from "@/lib/referral-site/types"

const lookupReferralCode = cache(lookupReferralCodeUncached)

const DEMO_INVITE: CodeLookup = {
  code: DEMO_ME.code,
  status: "valid",
  referrer: { address: DEMO_ME.address, username: DEMO_ME.username, displayName: DEMO_ME.username },
  memberNumber: DEMO_ME.memberNumber,
}

function isDemoCode(code: string): boolean {
  return normalizeCode(code) === DEMO_ME.code
}

function demoLookup(code: string): CodeLookup {
  return isDemoCode(code) ? DEMO_INVITE : lookupDemoCode(code)
}

export async function generateMetadata({ params, searchParams }: PageProps<"/r/[code]">): Promise<Metadata> {
  const [{ code }, query] = await Promise.all([params, searchParams])
  const demo = isDemoCode(code)
  const lookup = demo ? DEMO_INVITE : await lookupReferralCode(code)
  if (lookup.status !== "valid") return { title: "Entropy Referrals" }
  const skin = marketSkin(query.m)
  const username = lookup.referrer.username
  const title = skin
    ? `${username} invited you to trade ${skin.name} | Entropy`
    : `${username} invited you to Entropy | Trade the Frontier`
  const description = skin
    ? `Perpetual futures on ${skin.name} and other markets that are hard to trade elsewhere.`
    : "Perpetual futures on OpenAI, Nvidia and other markets that are hard to trade elsewhere."
  const ticket = `/api/site/ticket/${encodeURIComponent(lookup.code)}`
  const imageUrl = skin ? `${ticket}?m=${skin.id}&format=og` : demo ? `${ticket}?format=og` : null
  const images = imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined
  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "Entropy", ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images } : {}) },
  }
}

export default async function InviteSignupPage({ params, searchParams }: PageProps<"/r/[code]">) {
  const [{ code }, query] = await Promise.all([params, searchParams])
  if (isDemoCode(code) && !signupDemo(query.demo)) {
    const skin = marketSkin(query.m)
    redirect(`/r/${DEMO_ME.code}?demo=success${skin ? `&m=${skin.id}` : ""}`)
  }
  const demo = signupDemo(query.demo)
  const origin = await requestOrigin()
  const market = marketSkin(query.m)?.id ?? null
  return (
    <SignupScreen
      invite={demo ? demoLookup(code) : await lookupReferralCode(code)}
      initialCode=""
      demo={demo}
      origin={origin}
      market={market}
    />
  )
}
