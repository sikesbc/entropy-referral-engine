import "server-only"
import { getEarningsSeries, parseEarningsRange } from "@/backend/site/earnings-series"
import { requireSessionUserId, respond } from "@/backend/site/http"

export function GET(request: Request) {
  return respond(async () => {
    const privyUserId = await requireSessionUserId(request)
    const range = parseEarningsRange(new URL(request.url).searchParams.get("range"))
    return getEarningsSeries(privyUserId, range)
  })
}
