import "server-only"
import { respond } from "@/backend/site/http"
import { checkUsername } from "@/backend/site/usernames"

export function GET(_request: Request, context: RouteContext<"/api/site/usernames/[name]">) {
  return respond(async () => checkUsername((await context.params).name))
}
