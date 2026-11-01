import "server-only"
import { requireSessionUserId, respond } from "@/backend/site/http"
import { getMe } from "@/backend/site/me"

export function GET(request: Request) {
  return respond(async () => getMe(await requireSessionUserId(request)))
}
