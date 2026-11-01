import "server-only"
import { lookupReferralCode } from "@/backend/site/codes"
import { respond } from "@/backend/site/http"

export function GET(_request: Request, context: RouteContext<"/api/site/codes/[code]">) {
  return respond(async () => lookupReferralCode((await context.params).code))
}
