import "server-only"
import { timingSafeEqual } from "node:crypto"
import { syncAll } from "@/backend/sync/sync-all"

export const dynamic = "force-dynamic"
export const maxDuration = 300

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(request.headers.get("authorization") ?? "")
  return expected.length === received.length && timingSafeEqual(expected, received)
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    return Response.json(await syncAll())
  } catch (error) {
    const message = error instanceof Error ? error.message : "sync failed"
    return Response.json({ error: message }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
