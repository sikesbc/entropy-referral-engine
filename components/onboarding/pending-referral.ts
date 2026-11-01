const PENDING_REFERRAL_KEY = "entropy:pending-referral"
const REFERRAL_DRAFT_KEY = "entropy:onboarding-referral-draft"

function read(storage: () => Storage, key: string): string {
  try {
    return storage().getItem(key) ?? ""
  } catch {
    return ""
  }
}

function write(storage: () => Storage, key: string, value: string) {
  try {
    if (value) storage().setItem(key, value)
    else storage().removeItem(key)
  } catch {
    return
  }
}

const local = () => window.localStorage
const session = () => window.sessionStorage

export function storePendingReferral(code: string) {
  write(local, PENDING_REFERRAL_KEY, code)
}

export function clearPendingReferral() {
  write(local, PENDING_REFERRAL_KEY, "")
}

export function readReferralDraft(): string {
  return read(session, REFERRAL_DRAFT_KEY) || read(local, PENDING_REFERRAL_KEY)
}

export function storeReferralDraft(code: string) {
  write(session, REFERRAL_DRAFT_KEY, code)
}

export function referralCodeFromSearch(search: string): string | null {
  const code = new URLSearchParams(search).get("r")?.trim()
  return code ? code : null
}
