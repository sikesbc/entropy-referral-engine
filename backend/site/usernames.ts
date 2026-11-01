import "server-only"
import type postgres from "postgres"
import { db } from "@/backend/db/client"
import {
  isReservedUsername,
  isValidUsername,
  normalizeUsername,
  usernameToCode,
} from "@/backend/referrals/codes"
import type { UsernameAvailability } from "@/lib/referral-site/types"

export async function isUsernameTaken(
  sql: postgres.Sql | postgres.TransactionSql,
  username: string,
): Promise<boolean> {
  const code = usernameToCode(username)
  const rows = await sql<{ taken: boolean }[]>`
    select
      exists (select 1 from users where lower(username) = ${code})
      or exists (select 1 from referral_codes where code = ${code}) as taken
  `
  return rows[0]?.taken ?? false
}

export async function checkUsername(input: string): Promise<UsernameAvailability> {
  const username = normalizeUsername(input)
  if (!isValidUsername(username)) return { available: false, reason: "invalid" }
  if (isReservedUsername(username)) return { available: false, reason: "reserved" }
  if (await isUsernameTaken(db(), username)) return { available: false, reason: "taken" }
  return { available: true }
}
