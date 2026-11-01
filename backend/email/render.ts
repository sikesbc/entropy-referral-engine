import { marketSkin } from "@/backend/og/market-skins"
import type { EmailKind } from "./decide"

export type MessageKind = EmailKind | "weekly"

export type EventPayload = {
  username?: string
  coin?: string
  earnedUsd?: string
  until?: string
  rate?: string
}

export type WeeklyPayload = { joined: EventPayload[]; firstTrades: EventPayload[]; other: number }

export type Recipient = { code: string | null; unsubscribeUrl: string }

export type RenderedEmail = { subject: string; html: string; text: string }

const ORANGE = "#fc6134"

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "")
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

function usd(value: string | undefined): string {
  return `$${(Number(value) || 0).toFixed(2)}`
}

function marketName(coin: string | undefined): string {
  const symbol = (coin ?? "").replace(/^io:/, "")
  return marketSkin(symbol)?.name ?? (symbol || "a market")
}

function percent(rate: string | undefined): string {
  return `${Math.round((Number(rate) || 0.75) * 100)}%`
}

function day(iso: string | undefined): string {
  const date = iso ? new Date(iso) : new Date()
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function headline(kind: EmailKind, payload: EventPayload): { subject: string; news: string } {
  const name = payload.username ?? "Someone"
  const market = marketName(payload.coin)
  if (kind === "joined")
    return { subject: `${name} joined with your link`, news: `${name} joined Entropy with your link.` }
  if (kind === "first_trade") {
    return {
      subject: `${name} made their first trade`,
      news: `${name} made their first ${market} trade. You earned ${usd(payload.earnedUsd)}.`,
    }
  }
  if (kind === "unlock") {
    return {
      subject: `You unlocked ${market}`,
      news: `You unlocked ${market}. You get 60% of the fees Entropy makes on ${market} trades by friends who join from now on.`,
    }
  }
  return {
    subject: `Entropy boosted ${market}`,
    news: `Entropy boosted ${market}. You get ${percent(payload.rate)} of the fees Entropy makes on every friend’s ${market} trades until ${day(payload.until)}.`,
  }
}

function weeklyHeadline(payload: WeeklyPayload): { subject: string; news: string; items: string[] } {
  const earned = payload.firstTrades.reduce((sum, item) => sum + (Number(item.earnedUsd) || 0), 0)
  const parts = [
    payload.joined.length > 0 ? `${payload.joined.length} joined with your link` : null,
    payload.firstTrades.length > 0 ? `${payload.firstTrades.length} made their first trade` : null,
  ].filter((part): part is string => part !== null)
  const items = [
    ...payload.joined.map((item) => `${item.username ?? "Someone"} joined`),
    ...payload.firstTrades.map(
      (item) => `${item.username ?? "Someone"} traded ${marketName(item.coin)} (+${usd(item.earnedUsd)})`,
    ),
  ]
  if (payload.other > 0) items.push(`${payload.other} market update${payload.other === 1 ? "" : "s"}`)
  const summary = parts.length > 0 ? `This week, ${parts.join(" and ")}.` : "Here is your week on Entropy."
  return {
    subject: "Your week on Entropy",
    news: earned > 0 ? `${summary} You earned ${usd(String(earned))}.` : summary,
    items,
  }
}

function ticketUrl(code: string | null, coin: string | undefined): string | null {
  if (!code) return null
  const skin = marketSkin((coin ?? "").replace(/^io:/, ""))
  const market = skin ? `m=${skin.id}&` : ""
  return `${siteUrl()}/api/site/ticket/${encodeURIComponent(code)}?${market}format=og`
}

function layout(input: {
  news: string
  items: string[]
  image: string | null
  unsubscribeUrl: string
}): string {
  const site = siteUrl()
  const image = input.image
    ? `<tr><td style="padding:0 0 28px"><img src="${escapeHtml(input.image)}" width="520" alt="Your Entropy pass" style="display:block;width:100%;max-width:520px;height:auto;border:0;border-radius:12px"></td></tr>`
    : ""
  const items = input.items.length
    ? `<tr><td style="padding:0 0 28px;font:15px/1.6 -apple-system,Helvetica,Arial,sans-serif;color:#a3a3a3">${input.items.map(escapeHtml).join("<br>")}</td></tr>`
    : ""
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body style="margin:0;padding:0;background:#000000">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background:#000000"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px">
<tr><td style="padding:0 0 28px;font:600 18px -apple-system,Helvetica,Arial,sans-serif;color:#ffffff;letter-spacing:-0.01em">Entropy</td></tr>
${image}
<tr><td style="padding:0 0 28px;font:500 22px/1.4 -apple-system,Helvetica,Arial,sans-serif;color:#ffffff">${escapeHtml(input.news)}</td></tr>
${items}
<tr><td style="padding:0 0 40px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${ORANGE}" style="border-radius:10px;background:${ORANGE}"><a href="${site}/referrals" style="display:inline-block;padding:14px 28px;font:600 16px -apple-system,Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px">Share again</a></td></tr></table></td></tr>
<tr><td style="border-top:1px solid #262626;padding:20px 0 0;font:13px/1.6 -apple-system,Helvetica,Arial,sans-serif;color:#737373">You get this email because you refer friends to Entropy.<br><a href="${site}/referrals#email" style="color:#a3a3a3">Email settings</a> &nbsp;·&nbsp; <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#a3a3a3">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`
}

function plainText(news: string, items: string[], unsubscribeUrl: string): string {
  const site = siteUrl()
  return [
    news,
    ...(items.length ? ["", ...items.map((item) => `- ${item}`)] : []),
    "",
    `Share again: ${site}/referrals`,
    "",
    `Email settings: ${site}/referrals#email`,
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n")
}

export function renderEvent(kind: EmailKind, payload: EventPayload, recipient: Recipient): RenderedEmail {
  const { subject, news } = headline(kind, payload)
  const image = ticketUrl(recipient.code, payload.coin)
  return {
    subject,
    html: layout({ news, items: [], image, unsubscribeUrl: recipient.unsubscribeUrl }),
    text: plainText(news, [], recipient.unsubscribeUrl),
  }
}

export function renderWeekly(payload: WeeklyPayload, recipient: Recipient): RenderedEmail {
  const { subject, news, items } = weeklyHeadline(payload)
  const image = ticketUrl(recipient.code, payload.firstTrades[0]?.coin)
  return {
    subject,
    html: layout({ news, items, image, unsubscribeUrl: recipient.unsubscribeUrl }),
    text: plainText(news, items, recipient.unsubscribeUrl),
  }
}

export function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/api/site/email/unsubscribe?t=${encodeURIComponent(token)}`
}

export const SAMPLE_TYPES = ["joined", "first_trade", "unlock", "boost", "weekly"] as const

export type SampleType = (typeof SAMPLE_TYPES)[number]

const SAMPLE_EVENT: EventPayload = { username: "Maya", coin: "io:NVDA", earnedUsd: "4.20", rate: "0.75" }

export function renderSample(type: SampleType, recipient: Recipient): RenderedEmail {
  if (type !== "weekly") {
    return renderEvent(
      type,
      { ...SAMPLE_EVENT, until: new Date(Date.now() + 7 * 86_400_000).toISOString() },
      recipient,
    )
  }
  return renderWeekly(
    {
      joined: [{ username: "Theo" }, { username: "Priya" }],
      firstTrades: [SAMPLE_EVENT, { username: "Jonas", coin: "io:OAI", earnedUsd: "1.85" }],
      other: 0,
    },
    recipient,
  )
}
