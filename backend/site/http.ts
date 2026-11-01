import "server-only"
import { getSessionUser, getSessionUserId, type SessionUser } from "@/backend/auth/session"
import { SiteError } from "./errors"

export async function requireSession(request: Request): Promise<SessionUser> {
  const session = await getSessionUser(request)
  if (!session) throw new SiteError(401, "unauthorized", "Sign in with your wallet to continue.")
  return session
}

export async function requireSessionUserId(request: Request): Promise<string> {
  const privyUserId = await getSessionUserId(request)
  if (!privyUserId) throw new SiteError(401, "unauthorized", "Sign in with your wallet to continue.")
  return privyUserId
}

export async function respond(run: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json(await run(), { headers: { "cache-control": "no-store" } })
  } catch (error) {
    if (error instanceof SiteError) {
      return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status })
    }
    console.error(error)
    return Response.json(
      { error: { code: "internal", message: "Something went wrong. Try again." } },
      { status: 500 },
    )
  }
}
