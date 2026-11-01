import "server-only"
import { getSessionUser } from "@/backend/auth/session"
import { SAMPLE_TYPES, type SampleType } from "@/backend/email/render"
import { sendTestEmail } from "@/backend/email/settings"
import { SiteError } from "@/backend/site/errors"

export const dynamic = "force-dynamic"

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status })
}

export async function POST(request: Request) {
  if (process.env.DEMO_TOOLS !== "1") return json({ error: "not_found" }, 404)

  const session = await getSessionUser(request)
  if (!session) return json({ error: "unauthorized" }, 401)

  const body = (await request.json().catch(() => null)) as { type?: unknown } | null
  const type = typeof body?.type === "string" ? body.type : "first_trade"
  if (!SAMPLE_TYPES.includes(type as SampleType)) return json({ error: "invalid_type" }, 400)

  try {
    const result = await sendTestEmail(session.privyUserId, type as SampleType)
    return json({ ok: result.status !== "failed", ...result }, result.status === "failed" ? 502 : 200)
  } catch (error) {
    if (error instanceof SiteError) return json({ error: error.code }, error.status)
    console.error(error)
    return json({ error: "internal" }, 500)
  }
}
