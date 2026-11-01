import "server-only"
import { renderSample, SAMPLE_TYPES, unsubscribeUrl, type SampleType } from "@/backend/email/render"
import { DEMO_ME } from "@/lib/referral-site/mock-data"

export const dynamic = "force-dynamic"

export function GET(request: Request) {
  const search = new URL(request.url).searchParams
  const type = search.get("type") ?? "first_trade"
  if (!SAMPLE_TYPES.includes(type as SampleType)) {
    return Response.json({ error: "invalid_type", types: SAMPLE_TYPES }, { status: 400 })
  }
  const email = renderSample(type as SampleType, {
    code: search.get("code") ?? DEMO_ME.code,
    unsubscribeUrl: unsubscribeUrl("preview"),
  })
  if (search.get("format") === "text") {
    return new Response(email.text, { headers: { "content-type": "text/plain; charset=utf-8" } })
  }
  return new Response(email.html, {
    headers: { "content-type": "text/html; charset=utf-8", "x-email-subject": email.subject },
  })
}
