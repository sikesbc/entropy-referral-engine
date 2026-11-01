import "server-only"
import { requireSessionUserId, respond } from "@/backend/site/http"
import { getReferrals } from "@/backend/site/referrals"

export function GET(request: Request) {
  return respond(async () => getReferrals(await requireSessionUserId(request)))
}
