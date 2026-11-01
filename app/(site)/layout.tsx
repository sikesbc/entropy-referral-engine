import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SiteProviders } from "@/components/site/site-providers"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Entropy Referrals",
  description: "Get a link. Earn half of what Entropy makes in fees on your referrals’ io trades.",
  twitter: { card: "summary_large_image" },
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://auth.privy.io" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://auth.privy.io" />
      <SiteProviders>{children}</SiteProviders>
    </>
  )
}
