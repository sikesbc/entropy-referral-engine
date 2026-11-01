import "server-only"
import { getEmailSettings, saveEmailSettings } from "@/backend/email/settings"
import { requireSessionUserId, respond } from "@/backend/site/http"

export const dynamic = "force-dynamic"

export function GET(request: Request) {
  return respond(async () => getEmailSettings(await requireSessionUserId(request)))
}

export function PUT(request: Request) {
  return respond(async () => {
    const privyUserId = await requireSessionUserId(request)
    return saveEmailSettings(privyUserId, await request.json().catch(() => null))
  })
}
