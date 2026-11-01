import "server-only"
import postgres from "postgres"
import type { SessionUser } from "@/backend/auth/session"
import { db } from "@/backend/db/client"
import { getUserRole, rootAddress } from "@/backend/hyperliquid/info"
import {
  decideAttribution,
  type AttributionDecision,
  type UnattributedReason,
} from "@/backend/referrals/attribution"
import { isValidCode, normalizeCode, normalizeUsername, usernameToCode } from "@/backend/referrals/codes"
import type {
  Attribution,
  EligibilityStatus,
  NotAttributedReason,
  Referrer,
  SignupRequest,
  SignupResponse,
  SiteMe,
} from "@/lib/referral-site/types"
import { usernameProblem } from "@/lib/referral-site/username"
import { SiteError } from "./errors"
import { hasIoHistory } from "./io-history"
import { findMeByAddress, findMeByPrivyUser } from "./me"
import { isUsernameTaken } from "./usernames"

const UNIQUE_VIOLATION = "23505"
const USERNAME_CONSTRAINTS = new Set(["users_username_lower", "referral_codes_pkey"])
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/

type SignupOutcome = "attributed" | Exclude<UnattributedReason, "already_registered">

async function findRegistered(privyUserId: string, root: string) {
  return (await findMeByPrivyUser(privyUserId)) ?? (await findMeByAddress(root))
}

async function findCodeOwner(code: string): Promise<Referrer | null> {
  if (!isValidCode(code)) return null
  const rows = await db()<{ address: string; username: string }[]>`
    select rc.address, u.username
    from referral_codes rc
    join users u on u.address = rc.address
    where rc.code = ${code}
  `
  const row = rows[0]
  return row ? { address: row.address, username: row.username, displayName: row.username } : null
}

function isUniqueViolation(error: unknown): error is postgres.PostgresError {
  return error instanceof postgres.PostgresError && error.code === UNIQUE_VIOLATION
}

function isUsernameViolation(error: postgres.PostgresError): boolean {
  return error.constraint_name !== undefined && USERNAME_CONSTRAINTS.has(error.constraint_name)
}

function usernameTaken(): SiteError {
  return new SiteError(409, "username_taken", "That username is already taken.")
}

export function validateUsername(rawUsername: string): string {
  const username = normalizeUsername(rawUsername)
  const problem = usernameProblem(username)
  if (problem === "reserved") throw new SiteError(400, "reserved_username", "That username is reserved.")
  if (problem === "trailing_underscore") {
    throw new SiteError(400, "invalid_username", "Usernames can't end with an underscore.")
  }
  if (problem !== null) {
    throw new SiteError(
      400,
      "invalid_username",
      "Usernames are 3 to 30 characters: letters, numbers, and underscores.",
    )
  }
  return username
}

function unknownCode(): SiteError {
  return new SiteError(
    400,
    "unknown_code",
    "That code doesn't belong to anyone. Check the spelling or skip it.",
  )
}

async function resolveRoot(address: string): Promise<string> {
  const root = rootAddress(address, await getUserRole(address))
  if (root === null) {
    throw new SiteError(
      400,
      "vault_not_allowed",
      "Vault addresses can't sign up. Connect the wallet you trade with.",
    )
  }
  return root
}

export function eligibilityOf(registered: SiteMe | null, hasTraded: boolean): EligibilityStatus {
  if (registered) return registered.referredBy ? "has_referrer" : "registered"
  return hasTraded ? "has_traded" : "eligible"
}

export async function checkEligibility(address: string): Promise<{ status: EligibilityStatus }> {
  if (!ADDRESS_PATTERN.test(address))
    throw new SiteError(400, "invalid_address", "Enter a valid wallet address.")
  const root = await resolveRoot(address.toLowerCase())
  const registered = await findMeByAddress(root)
  return { status: eligibilityOf(registered, registered ? false : await hasIoHistory(root)) }
}

function ignoredCodeFor(code: string | null, me: SiteMe): string | null {
  return code === me.code ? null : code
}

function outcomeOf(decision: AttributionDecision): SignupOutcome {
  if (decision.kind === "attributed") return "attributed"
  if (decision.reason === "already_registered")
    throw new Error("Already-registered users never reach attribution")
  return decision.reason
}

function toAttribution(
  decision: AttributionDecision,
  code: string | null,
  referrer: Referrer | null,
): Attribution {
  if (decision.kind === "attributed" && code !== null && referrer)
    return { status: "attributed", code, referrer }
  if (
    decision.kind === "attributed" ||
    decision.reason === "already_registered" ||
    decision.reason === "no_code" ||
    code === null
  ) {
    return { status: "no_code" }
  }
  const reason: NotAttributedReason = decision.reason
  return { status: "not_attributed", code, reason, referrer: reason === "unknown_code" ? null : referrer }
}

export async function signup(session: SessionUser, request: SignupRequest): Promise<SignupResponse> {
  const code = request.code === null ? null : normalizeCode(request.code) || null
  const username = validateUsername(request.username)
  const root = await resolveRoot(session.walletAddress)

  const existing = await findRegistered(session.privyUserId, root)
  if (existing)
    return { status: "already_registered", me: existing, ignoredCode: ignoredCodeFor(code, existing) }

  const referrer = code === null ? null : await findCodeOwner(code)
  if (code !== null && referrer === null) throw unknownCode()

  if (await isUsernameTaken(db(), username)) throw usernameTaken()

  const decision = decideAttribution({
    refereeRoot: root,
    code,
    referrer: referrer === null ? null : { root: referrer.address },
    refereeAlreadyRegistered: false,
    refereeHasIoHistory: await hasIoHistory(root),
  })
  const outcome = outcomeOf(decision)

  try {
    await db().begin(async (sql) => {
      await sql`
        insert into users (address, signer_address, privy_user_id, username, signup_code, signup_outcome)
        values (${root}, ${session.walletAddress}, ${session.privyUserId}, ${username}, ${code}, ${outcome})
      `
      await sql`insert into referral_codes (code, address) values (${usernameToCode(username)}, ${root})`
      if (decision.kind === "attributed" && code !== null) {
        await sql`insert into attributions (referee, referrer, code) values (${root}, ${decision.referrerRoot}, ${code})`
      }
      await sql`insert into sync_state (address, cursor_ms) values (${root}, ${Date.now()})`
    })
  } catch (error) {
    if (!isUniqueViolation(error)) throw error
    const winner = await findRegistered(session.privyUserId, root)
    if (!winner) throw isUsernameViolation(error) ? usernameTaken() : error
    return { status: "already_registered", me: winner, ignoredCode: ignoredCodeFor(code, winner) }
  }

  const me = await findMeByAddress(root)
  if (!me) throw new Error("Signed-up user could not be loaded")
  return { status: "registered", me, attribution: toAttribution(decision, code, referrer) }
}
