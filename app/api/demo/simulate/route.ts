import "server-only"
import Big from "big.js"
import { randomBytes, randomUUID } from "node:crypto"
import { getSessionUser } from "@/backend/auth/session"
import { db } from "@/backend/db/client"
import { simulatedUsername, usernameToCode } from "@/backend/referrals/codes"
import { isUsernameTaken } from "@/backend/site/usernames"
import { ingestFills } from "@/backend/sync/ingest"
import { buildSimulatedFill } from "@/backend/sync/simulated-fill"

export const dynamic = "force-dynamic"

const USERNAME_ATTEMPTS = 8

type Action = "add_referral" | "trade"

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status })
}

function parseAction(value: unknown): Action | null {
  if (typeof value !== "object" || value === null) return null
  const action = (value as { action?: unknown }).action
  return action === "add_referral" || action === "trade" ? action : null
}

async function addReferral(referrer: string) {
  const address = `0x${randomBytes(20).toString("hex")}`
  const now = Date.now()

  return db().begin(async (tx) => {
    const [current] = await tx<{ code: string }[]>`
      select code from referral_codes where address = ${referrer} and is_current
    `
    if (!current) return null

    let username: string | null = null
    for (let attempt = 0; attempt < USERNAME_ATTEMPTS && username === null; attempt++) {
      const candidate = simulatedUsername(Math.random)
      if (!(await isUsernameTaken(tx, candidate))) username = candidate
    }
    if (username === null) throw new Error("could not generate a unique username")

    await tx`
      insert into users (address, signer_address, privy_user_id, username, signup_code, signup_outcome, simulated)
      values (${address}, ${address}, ${`demo:${randomUUID()}`}, ${username}, ${current.code}, 'attributed', true)
    `
    await tx`insert into referral_codes (code, address) values (${usernameToCode(username)}, ${address})`

    await tx`
      insert into attributions (referee, referrer, code, attributed_at)
      values (${address}, ${referrer}, ${current.code}, ${new Date(now)})
    `
    await tx`insert into sync_state (address, cursor_ms) values (${address}, ${now})`

    return { referee: address, username, code: usernameToCode(username) }
  })
}

async function trade(referrer: string) {
  const referees = await db()<{ referee: string; attributed_at: Date }[]>`
    select a.referee, a.attributed_at
    from attributions a
    join users u on u.address = a.referee
    where a.referrer = ${referrer} and u.simulated
  `
  if (referees.length === 0) return null

  const chosen = referees[Math.floor(Math.random() * referees.length)]
  const fill = buildSimulatedFill(Math.random, Date.now())
  const result = await ingestFills(
    chosen.referee,
    referrer,
    chosen.attributed_at.getTime(),
    [{ ...fill, traderAddress: chosen.referee }],
    "simulated",
  )
  const [recorded] = await db()<{ username: string; net_fee: string | null; earned: string | null }[]>`
    select u.username, e.net_fee::text as net_fee, e.referrer_earned::text as earned
    from users u
    left join earnings e on e.referee = u.address and e.tid = ${fill.tid}
    where u.address = ${chosen.referee}
  `
  return {
    referee: chosen.referee,
    username: recorded.username,
    tid: fill.tid,
    coin: fill.coin,
    px: fill.px,
    sz: fill.sz,
    fee: fill.fee,
    notionalUsd: new Big(fill.px).times(fill.sz).toFixed(),
    feeUsd: recorded.net_fee ?? fill.fee,
    earnedUsd: recorded.earned ?? "0",
    ...result,
  }
}

export async function POST(request: Request) {
  if (process.env.DEMO_TOOLS !== "1") return json({ error: "not_found" }, 404)

  const session = await getSessionUser(request)
  if (!session) return json({ error: "unauthorized" }, 401)

  const action = parseAction(await request.json().catch(() => null))
  if (!action) return json({ error: "invalid_action" }, 400)

  const [user] = await db()<{ address: string }[]>`
    select address from users where privy_user_id = ${session.privyUserId}
  `
  if (!user) return json({ error: "not_registered" }, 403)

  if (action === "add_referral") {
    const created = await addReferral(user.address)
    return created ? json({ ok: true, ...created }) : json({ error: "no_referral_code" }, 409)
  }

  const traded = await trade(user.address)
  return traded ? json({ ok: true, ...traded }) : json({ error: "no_simulated_referees" }, 409)
}
