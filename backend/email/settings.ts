import "server-only"
import { db } from "@/backend/db/client"
import { SiteError } from "@/backend/site/errors"
import { DEFAULT_PREFS, type EmailPrefs } from "./decide"
import { renderSample, unsubscribeUrl, type SampleType } from "./render"
import { sendEmail, type SendResult } from "./send"
import { unsubscribeToken } from "./token"

export type EmailSettings = { email: string | null; subscribed: boolean; prefs: EmailPrefs }

type Row = EmailPrefs & { email: string; unsubscribedAt: Date | null; code: string | null }

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

async function addressFor(privyUserId: string): Promise<string> {
  const [user] = await db()<
    { address: string }[]
  >`select address from users where privy_user_id = ${privyUserId}`
  if (!user) throw new SiteError(403, "not_registered", "Sign up before adding an email.")
  return user.address
}

async function loadRow(address: string): Promise<Row | null> {
  const [row] = await db()<Row[]>`
    select s.email, s.joined, s.first_trade as "firstTrade", s.unlock, s.boost, s.weekly_only as "weeklyOnly",
      s.unsubscribed_at as "unsubscribedAt", rc.code
    from email_subscriptions s
    left join referral_codes rc on rc.address = s.address and rc.is_current
    where s.address = ${address}
  `
  return row ?? null
}

function toSettings(row: Row | null): EmailSettings {
  if (!row) return { email: null, subscribed: false, prefs: DEFAULT_PREFS }
  const { email, unsubscribedAt, joined, firstTrade, unlock, boost, weeklyOnly } = row
  return {
    email,
    subscribed: unsubscribedAt === null,
    prefs: { joined, firstTrade, unlock, boost, weeklyOnly },
  }
}

export async function getEmailSettings(privyUserId: string): Promise<EmailSettings> {
  return toSettings(await loadRow(await addressFor(privyUserId)))
}

function parsePrefs(value: unknown, fallback: EmailPrefs): EmailPrefs {
  const input = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}
  const pick = (key: keyof EmailPrefs) =>
    typeof input[key] === "boolean" ? (input[key] as boolean) : fallback[key]
  return {
    joined: pick("joined"),
    firstTrade: pick("firstTrade"),
    unlock: pick("unlock"),
    boost: pick("boost"),
    weeklyOnly: pick("weeklyOnly"),
  }
}

export async function saveEmailSettings(privyUserId: string, body: unknown): Promise<EmailSettings> {
  const address = await addressFor(privyUserId)
  const input =
    typeof body === "object" && body !== null ? (body as { email?: unknown; prefs?: unknown }) : {}
  const current = toSettings(await loadRow(address))
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : current.email
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new SiteError(400, "invalid_email", "Enter a valid email address.")
  }
  const prefs = parsePrefs(input.prefs, current.prefs)
  await db()`
    insert into email_subscriptions (address, email, joined, first_trade, unlock, boost, weekly_only)
    values (${address}, ${email}, ${prefs.joined}, ${prefs.firstTrade}, ${prefs.unlock}, ${prefs.boost}, ${prefs.weeklyOnly})
    on conflict (address) do update set
      email = excluded.email, joined = excluded.joined, first_trade = excluded.first_trade, unlock = excluded.unlock,
      boost = excluded.boost, weekly_only = excluded.weekly_only, unsubscribed_at = null, updated_at = now()
  `
  return { email, subscribed: true, prefs }
}

export async function unsubscribe(address: string): Promise<void> {
  await db()`update email_subscriptions set unsubscribed_at = coalesce(unsubscribed_at, now()) where address = ${address}`
}

export async function sendTestEmail(
  privyUserId: string,
  type: SampleType,
): Promise<SendResult & { to: string }> {
  const address = await addressFor(privyUserId)
  const row = await loadRow(address)
  if (!row) throw new SiteError(409, "no_email", "Save an email address first.")
  const link = unsubscribeUrl(unsubscribeToken(address))
  const email = renderSample(type, { code: row.code, unsubscribeUrl: link })
  const result = await sendEmail({
    address,
    to: row.email,
    kind: `test:${type}`,
    email,
    unsubscribeUrl: link,
  })
  return { ...result, to: row.email }
}
