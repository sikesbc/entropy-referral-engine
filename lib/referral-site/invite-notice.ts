import type { CodeLookup, SiteMe } from "./types"

export const INVITE_NOTICE_PARAM = "invite"
export const IGNORED_INVITE_VALUE = "ignored"
export const OWN_INVITE_VALUE = "own"

export type InviteNotice = { status: "own" } | { status: "ignored"; username: string | null }

export function inviteNoticeFor(
  invite: CodeLookup | null,
  me: Pick<SiteMe, "address" | "code">,
): InviteNotice | null {
  if (invite?.status !== "valid") return null
  const ownCode = invite.code === me.code.toLowerCase()
  const ownAddress = invite.referrer.address.toLowerCase() === me.address.toLowerCase()
  if (ownCode || ownAddress) return { status: "own" }
  return { status: "ignored", username: invite.referrer.username }
}

export function inviteNoticeHref(notice: InviteNotice | null, path = "/referrals"): string {
  if (!notice) return path
  const value = notice.status === "own" ? OWN_INVITE_VALUE : IGNORED_INVITE_VALUE
  return `${path}?${INVITE_NOTICE_PARAM}=${value}`
}

export function inviteNoticeOf(param: string | null, username: string | null): InviteNotice | null {
  if (param === OWN_INVITE_VALUE) return { status: "own" }
  if (param === IGNORED_INVITE_VALUE) return { status: "ignored", username }
  return null
}
