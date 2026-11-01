"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Check, ChevronDown, Copy, LogOut, Mail } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { lazy, Suspense, useEffect, useState } from "react"
import { SideSheet } from "@/components/referrals/intro/side-sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import { shortAddress } from "@/lib/format/address"
import { DEMO_ME } from "@/lib/referral-site/mock-data"
import { useMe } from "@/lib/referral-site/queries"
import { useSiteWallet } from "@/lib/referral-site/wallet"
import { ConnectWalletButton } from "./connect-wallet-button"

const EmailPreferences = lazy(() =>
  import("@/components/referrals/email/email-preferences").then((module) => ({
    default: module.EmailPreferences,
  })),
)

function preloadEmailPreferences() {
  void import("@/components/referrals/email/email-preferences")
}

const COPIED_MS = 1500

const EMAIL_HASH = "#email"

const ITEM_CLASS =
  "gap-2 rounded-[0.375rem] px-2 py-1.5 font-sans text-[0.8125rem] text-ink-soft focus:bg-ink/12 focus:text-ink"

export function WalletChip() {
  const { address, demo, disconnect } = useSiteWallet()
  const me = useMe()
  const router = useRouter()
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const onReferrals = pathname === "/referrals"

  useEffect(() => {
    if (!onReferrals) return
    const sync = () => {
      if (window.location.hash === EMAIL_HASH) setEmailOpen(true)
    }
    sync()
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [onReferrals])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  if (!address) return <ConnectWalletButton />

  const username = demo ? DEMO_ME.username : (me.data?.username ?? null)

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
    } catch {
      window.prompt("Copy this", address)
    }
  }

  const changeEmailOpen = (next: boolean) => {
    setEmailOpen(next)
    if (!next && window.location.hash === EMAIL_HASH) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search)
    }
  }

  const signOut = async () => {
    await disconnect()
    if (!demo) router.push("/")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Wallet menu, ${username ?? shortAddress(address)}`}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-panel-2 py-0.5 pl-0.5 pr-2 sm:gap-2 sm:pr-2.5 text-ink outline-none transition-colors hover:bg-panel-3 focus-visible:ring-2 focus-visible:ring-line"
        >
          <WalletAvatar seed={address} size="1.5rem" />
          {username ? (
            <span className="hidden text-[0.8125rem] font-medium sm:inline">{username}</span>
          ) : (
            <span className="hidden font-mono text-[0.75rem] sm:inline">{shortAddress(address)}</span>
          )}
          <ChevronDown aria-hidden="true" className="size-3.5 text-ink-quiet" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="entropy-trade-scope min-w-[12rem] rounded-[0.5rem] border border-line-soft bg-panel p-1.5 text-ink shadow-xl ring-0"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
              {username ? <span className="text-[0.8125rem] font-medium text-ink">{username}</span> : null}
              <span className="font-mono text-[0.75rem] font-normal text-ink-quiet">
                {shortAddress(address)}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-line-soft" />
          <DropdownMenuItem className={ITEM_CLASS} closeOnClick={false} onClick={() => void copyAddress()}>
            {copied ? <Check size="0.875rem" className="text-up" /> : <Copy size="0.875rem" />}
            {copied ? "Copied" : "Copy address"}
          </DropdownMenuItem>
          {onReferrals ? (
            <DropdownMenuItem
              className={ITEM_CLASS}
              onPointerEnter={preloadEmailPreferences}
              onFocus={preloadEmailPreferences}
              onClick={() => setEmailOpen(true)}
            >
              <Mail size="0.875rem" />
              Email settings
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem className={ITEM_CLASS} onClick={() => void signOut()}>
            <LogOut size="0.875rem" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {onReferrals ? (
        <Dialog.Root open={emailOpen} onOpenChange={changeEmailOpen}>
          <SideSheet title="Email settings" description="Pick what we email you about.">
            <Suspense fallback={null}>
              <EmailPreferences />
            </Suspense>
          </SideSheet>
        </Dialog.Root>
      ) : null}
    </>
  )
}
