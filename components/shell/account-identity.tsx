"use client"

import type { AppIdentity } from "@/components/app-auth/app-identity"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { shortAddress } from "@/lib/format/address"

export function AccountIdentity({ identity }: { identity: AppIdentity }) {
  const { me } = identity
  if (!me) return null
  return (
    <>
      <div className="flex flex-col gap-0.5 px-2 py-1.5 font-sans">
        <span className="truncate text-[0.8125rem] font-medium text-ink">@{me.username}</span>
        <span className="font-mono text-[0.6875rem] text-ink-quiet" title={me.address}>
          {shortAddress(me.address)}
        </span>
      </div>
      <DropdownMenuSeparator className="bg-line-soft" />
    </>
  )
}
