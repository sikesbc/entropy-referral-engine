export type EmailKind = "joined" | "first_trade" | "unlock" | "boost"

export type Delivery = "immediate" | "batched" | "skipped"

export type EmailPrefs = {
  joined: boolean
  firstTrade: boolean
  unlock: boolean
  boost: boolean
  weeklyOnly: boolean
}

export const INDIVIDUAL_LIMIT = 3

export const DEFAULT_PREFS: EmailPrefs = {
  joined: true,
  firstTrade: true,
  unlock: true,
  boost: true,
  weeklyOnly: false,
}

function kindEnabled(prefs: EmailPrefs, kind: EmailKind): boolean {
  if (kind === "joined") return prefs.joined
  if (kind === "first_trade") return prefs.firstTrade
  if (kind === "unlock") return prefs.unlock
  return prefs.boost
}

export function decideDelivery(input: {
  kind: EmailKind
  prefs: EmailPrefs | null
  sentIndividually: number
}): Delivery {
  const { kind, prefs, sentIndividually } = input
  if (!prefs || !kindEnabled(prefs, kind)) return "skipped"
  if (prefs.weeklyOnly) return "batched"
  if (kind === "unlock" || kind === "boost") return "immediate"
  return sentIndividually < INDIVIDUAL_LIMIT ? "immediate" : "batched"
}

export function isoWeek(now: Date): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((date.getTime() - yearStart) / 86_400_000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
}
