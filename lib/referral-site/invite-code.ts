import { fetchCode } from "./api"
import { normalizeCode } from "./code"
import type { CodeLookup } from "./types"

export type InviteCodeCheck =
  { status: "valid"; username: string } | { status: "unknown" } | { status: "own" } | { status: "error" }

export type InviteCodeViewer = { address?: string | null; code?: string | null }

export function inviteCodeCheckOf(lookup: CodeLookup, viewer: InviteCodeViewer = {}): InviteCodeCheck {
  if (lookup.status !== "valid") return { status: "unknown" }
  const ownAddress = viewer.address
    ? lookup.referrer.address.toLowerCase() === viewer.address.toLowerCase()
    : false
  const ownCode = viewer.code ? lookup.code === normalizeCode(viewer.code) : false
  if (ownAddress || ownCode) return { status: "own" }
  return { status: "valid", username: lookup.referrer.username }
}

export async function checkInviteCode(
  code: string,
  viewer: InviteCodeViewer = {},
  lookup: (code: string) => Promise<CodeLookup> = fetchCode,
): Promise<InviteCodeCheck> {
  const normalized = normalizeCode(code)
  if (!normalized) return { status: "unknown" }
  try {
    return inviteCodeCheckOf(await lookup(normalized), viewer)
  } catch {
    return { status: "error" }
  }
}
