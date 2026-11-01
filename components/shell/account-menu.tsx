"use client"

import { ArrowDownToLine, Gift, LogOut, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOptionalAppIdentity } from "@/components/app-auth/app-identity"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import { useAuth, useSession } from "@/lib/auth/auth-context"
import { AccountIdentity } from "./account-identity"
import { ACCOUNT_MENU_ITEM_CLASS } from "./account-menu-styles"
import { DarkModeMenuItem } from "./dark-mode-menu-item"

export function AccountMenu({ onWithdraw }: { onWithdraw?: () => void }) {
  const { user } = useSession()
  const { signOut } = useAuth()
  const identity = useOptionalAppIdentity()
  const router = useRouter()
  const avatarSeed = identity?.privyUserId ?? user?.privyUserId ?? user?.walletAddress
  const avatarSrc = identity ? null : user?.avatarUrl

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-line"
      >
        <WalletAvatar seed={avatarSeed} src={avatarSrc} size="1.75rem" className="rounded-full" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="entropy-trade-scope min-w-[10rem] rounded-[0.5rem] border border-line-soft bg-panel p-1.5 text-ink shadow-xl ring-0"
      >
        {identity ? <AccountIdentity identity={identity} /> : null}
        <DropdownMenuItem className={ACCOUNT_MENU_ITEM_CLASS} onClick={() => router.push("/profile")}>
          <UserRound size="0.875rem" />
          Portfolio
        </DropdownMenuItem>
        <DropdownMenuItem
          className={ACCOUNT_MENU_ITEM_CLASS}
          onClick={() => router.push("/entropy-referrals")}
        >
          <Gift size="0.875rem" />
          Referrals
        </DropdownMenuItem>
        <DropdownMenuItem className={ACCOUNT_MENU_ITEM_CLASS} onClick={onWithdraw}>
          <ArrowDownToLine size="0.875rem" />
          Withdraw
        </DropdownMenuItem>
        <DropdownMenuItem className={ACCOUNT_MENU_ITEM_CLASS} onClick={() => void signOut()}>
          <LogOut size="0.875rem" />
          Log out
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-line-soft" />
        <DarkModeMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
