import "server-only"
import { SiteError } from "@/backend/site/errors"
import { respond } from "@/backend/site/http"
import { checkEligibility } from "@/backend/site/signup"

const CACHE_CONTROL = "public, max-age=0, s-maxage=30, stale-while-revalidate=120"

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address")
  const response = await respond(async () => {
    if (!address) throw new SiteError(400, "invalid_address", "Enter a valid wallet address.")
    return checkEligibility(address)
  })
  if (response.ok) response.headers.set("cache-control", CACHE_CONTROL)
  return response
}
