import "server-only"
import { SiteError } from "@/backend/site/errors"
import { requireSession, respond } from "@/backend/site/http"
import { signup } from "@/backend/site/signup"
import type { SignupRequest } from "@/lib/referral-site/types"

const MAX_FIELD_LENGTH = 64

async function readRequest(request: Request): Promise<SignupRequest> {
  const body: unknown = await request.json().catch(() => null)
  if (typeof body !== "object" || body === null || !("code" in body) || !("username" in body)) {
    throw new SiteError(400, "bad_request", "Expected a JSON body with code and username fields.")
  }
  const { code, username } = body
  if (typeof username !== "string" || username.length > MAX_FIELD_LENGTH) {
    throw new SiteError(400, "invalid_username", "The username is not valid.")
  }
  if (code !== null && (typeof code !== "string" || code.length > MAX_FIELD_LENGTH)) {
    throw new SiteError(400, "bad_request", "The code is not valid.")
  }
  return { code, username }
}

export function POST(request: Request) {
  return respond(async () => {
    const session = await requireSession(request)
    return signup(session, await readRequest(request))
  })
}
