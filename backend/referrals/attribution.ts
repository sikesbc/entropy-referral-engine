import "server-only"

export type AttributionInput = {
  refereeRoot: string
  code: string | null
  referrer: { root: string } | null
  refereeAlreadyRegistered: boolean
  refereeHasIoHistory: boolean
}

export type UnattributedReason =
  "no_code" | "unknown_code" | "self_referral" | "existing_trader" | "already_registered"

export type AttributionDecision =
  { kind: "attributed"; referrerRoot: string } | { kind: "unattributed"; reason: UnattributedReason }

function unattributed(reason: UnattributedReason): AttributionDecision {
  return { kind: "unattributed", reason }
}

export function decideAttribution(input: AttributionInput): AttributionDecision {
  if (input.refereeAlreadyRegistered) return unattributed("already_registered")
  if (input.code === null) return unattributed("no_code")
  if (input.referrer === null) return unattributed("unknown_code")
  if (input.referrer.root === input.refereeRoot) return unattributed("self_referral")
  if (input.refereeHasIoHistory) return unattributed("existing_trader")
  return { kind: "attributed", referrerRoot: input.referrer.root }
}
