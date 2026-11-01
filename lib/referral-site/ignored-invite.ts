"use client"

import { useSearchParams } from "next/navigation"
import { useMemo, useSyncExternalStore } from "react"
import { IGNORED_INVITE_VALUE, INVITE_NOTICE_PARAM, inviteNoticeOf, type InviteNotice } from "./invite-notice"

const STORAGE_KEY = "entropy.site.ignoredInviteFrom"

export const IGNORED_INVITE_PARAM = INVITE_NOTICE_PARAM
export { IGNORED_INVITE_VALUE }

export function rememberIgnoredInvite(username: string | null): void {
  try {
    if (username) window.sessionStorage.setItem(STORAGE_KEY, username)
    else window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}

export function rememberInviteNotice(notice: InviteNotice | null): void {
  rememberIgnoredInvite(notice?.status === "ignored" ? notice.username : null)
}

export function forgetIgnoredInvite(): void {
  rememberIgnoredInvite(null)
}

function subscribe(): () => void {
  return () => {}
}

function readUsername(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function useIgnoredInviteUsername(): string | null {
  return useSyncExternalStore(subscribe, readUsername, () => null)
}

export function useInviteNotice(): InviteNotice | null {
  const param = useSearchParams().get(INVITE_NOTICE_PARAM)
  const username = useIgnoredInviteUsername()
  return useMemo(() => inviteNoticeOf(param, username), [param, username])
}
