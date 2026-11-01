import "server-only"
import { timingSafeEqual } from "node:crypto"
import { sendWeeklySummaries } from "@/backend/email/notify"

export const dynamic = "force-dynamic"
export const maxDuration = 300

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(request.headers.get("authorization") ?? "")
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 })
  try {
    return Response.json(await sendWeeklySummaries())
  } catch (error) {
    const message = error instanceof Error ? error.message : "weekly summary failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
