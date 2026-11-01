"use client"

import { useSession } from "@/lib/auth/auth-context"
import { AccountMenu } from "./account-menu"
import { AccountSummary } from "./account-summary"
import { DepositButton } from "./deposit-button"
import { LoginButton } from "./login-button"
import { ProButton } from "./pro-button"

export function HeaderActions() {
  const { isSignedIn } = useSession()
  return (
    <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
      {isSignedIn ? (
        <>
          <AccountSummary />
          <DepositButton />
          <ProButton />
          <AccountMenu />
        </>
      ) : (
        <>
          <ProButton />
          <LoginButton />
        </>
      )}
    </div>
  )
}
