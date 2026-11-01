import "server-only"
import { siteUrl } from "@/backend/email/render"
import { unsubscribe } from "@/backend/email/settings"
import { unsubscribeToken, verifyUnsubscribeToken } from "@/backend/email/token"

export const dynamic = "force-dynamic"

const SHELL_STYLE =
  "margin:0;background:#000;color:#fff;font:16px/1.5 -apple-system,Helvetica,Arial,sans-serif;display:grid;place-items:center;min-height:100vh"

const BUTTON_STYLE =
  "appearance:none;border:0;border-radius:999px;background:#fc6134;color:#000;font:600 15px/1 -apple-system,Helvetica,Arial,sans-serif;padding:14px 22px;cursor:pointer"

function page(body: string, status: number) {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Entropy</title><body style="${SHELL_STYLE}"><main style="max-width:420px;padding:24px">${body}<p><a href="${siteUrl()}/referrals#email" style="color:#fc6134">Email settings</a></p></main></body>`
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  })
}

function invalid() {
  return page("<p>This unsubscribe link is not valid.</p>", 400)
}

async function tokenFrom(request: Request): Promise<string> {
  const fromQuery = new URL(request.url).searchParams.get("t")
  if (fromQuery) return fromQuery
  const form = await request.formData().catch(() => null)
  const fromForm = form?.get("t")
  return typeof fromForm === "string" ? fromForm : ""
}

export async function GET(request: Request) {
  const address = verifyUnsubscribeToken(new URL(request.url).searchParams.get("t") ?? "")
  if (!address) return invalid()
  const action = `/api/site/email/unsubscribe?t=${encodeURIComponent(unsubscribeToken(address))}`
  return page(
    `<p>Stop all emails from Entropy?</p><form method="post" action="${action}" style="margin:24px 0"><button type="submit" style="${BUTTON_STYLE}">Unsubscribe</button></form>`,
    200,
  )
}

export async function POST(request: Request) {
  const address = verifyUnsubscribeToken(await tokenFrom(request))
  if (!address) return invalid()
  await unsubscribe(address)
  return page(
    "<p>You are unsubscribed. Entropy will not email you again unless you turn emails back on.</p>",
    200,
  )
}
