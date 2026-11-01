"use client"

import { Camera, Pencil, Upload } from "lucide-react"
import { useState, type FormEvent } from "react"
import { ACCOUNT_MENU_ITEM_CLASS } from "@/components/shell/account-menu-styles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletAvatar } from "@/components/ui/wallet-avatar"
import { shortAddress } from "@/lib/format/address"
import { USERNAME_MAX_LENGTH, usernameError } from "@/lib/profile/username"

export function ProfileIdentity({
  address,
  avatarSeed,
  avatarUrl,
  username,
  joined,
  onUsernameSubmit,
}: {
  address: string | null
  avatarSeed: string | null
  avatarUrl: string | null
  username: string | null
  joined: string | null
  onUsernameSubmit: (username: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const trimmed = draft.trim()
  const error = trimmed ? usernameError(trimmed) : null
  const displayName = username || (address ? shortAddress(address) : null) || "Your profile"

  const startEditing = () => {
    setDraft(username ?? "")
    setEditing(true)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!trimmed || trimmed === (username ?? "") || error) {
      if (!error) setEditing(false)
      return
    }
    onUsernameSubmit(trimmed)
    setEditing(false)
  }

  return (
    <section aria-label="Profile" className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Profile photo"
          className="group relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-line"
        >
          <WalletAvatar
            seed={avatarSeed ?? address ?? username}
            src={avatarUrl}
            className="size-[2.75rem] rounded-full"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[popup-open]:opacity-100">
            <Camera size="1rem" aria-hidden="true" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="entropy-trade-scope min-w-[10rem] rounded-[0.5rem] border border-line-soft bg-panel p-1.5 text-ink shadow-xl ring-0"
        >
          <DropdownMenuItem className={ACCOUNT_MENU_ITEM_CLASS}>
            <Upload size="0.875rem" />
            Upload photo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {editing ? (
          <form className="flex max-w-[22.5rem] items-center gap-1.5" onSubmit={submit}>
            <input
              autoFocus
              value={draft}
              maxLength={USERNAME_MAX_LENGTH}
              placeholder="Username"
              aria-label="Username"
              aria-invalid={Boolean(error)}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Escape") return
                event.preventDefault()
                setEditing(false)
              }}
              className="h-8 min-w-0 flex-1 rounded-[0.5rem] bg-panel-2 px-2.5 text-[0.8125rem] font-medium text-ink outline-none placeholder:text-ink-quiet disabled:opacity-60 dark:bg-panel-3"
            />
            <button
              type="submit"
              disabled={!trimmed || Boolean(error)}
              className="h-8 shrink-0 rounded-[0.4375rem] bg-[var(--entropy-orange)] px-3 text-[0.8125rem] font-medium text-[var(--entropy-light)] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-ink-quiet dark:disabled:bg-panel-3"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-8 shrink-0 rounded-[0.4375rem] bg-panel-2 px-3 text-[0.8125rem] font-medium text-ink transition-all hover:brightness-95 dark:bg-panel-3"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-[1.0625rem] font-medium leading-[1.375rem] tracking-[-0.0125em] text-ink">
              {displayName}
            </h1>
            <button
              type="button"
              aria-label="Edit username"
              onClick={startEditing}
              className="shrink-0 rounded-[0.375rem] p-1 text-ink-quiet transition-colors hover:bg-panel-2 hover:text-ink"
            >
              <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {editing ? (
          <span
            role="status"
            className={`h-[1.125rem] text-[0.75rem] ${error ? "text-down" : "text-ink-quiet"}`}
          >
            {error ?? ""}
          </span>
        ) : joined ? (
          <span className="text-[0.8125rem] leading-[1.0625rem] text-ink-quiet">{joined}</span>
        ) : address ? (
          <span
            className="font-mono text-[0.8125rem] leading-[1.0625rem] tracking-[-0.04em] text-ink-quiet"
            title={address}
          >
            {shortAddress(address)}
          </span>
        ) : null}
      </div>
    </section>
  )
}
