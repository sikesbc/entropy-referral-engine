import type { ReactNode } from "react"
import { AppAuthRoot } from "@/components/app-auth/app-auth-root"
import { OnboardingGate } from "@/components/onboarding/onboarding-gate"
import { AppFrame } from "@/components/shell/app-frame"
import { Header } from "@/components/shell/header"
import { APP_MODE } from "@/lib/app-mode"

export default function AppLayout({ children }: { children: ReactNode }) {
  const tree = (
    <OnboardingGate>
      <AppFrame>
        <Header />
        {children}
      </AppFrame>
    </OnboardingGate>
  )
  return APP_MODE ? <AppAuthRoot>{tree}</AppAuthRoot> : tree
}
