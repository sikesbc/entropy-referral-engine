import "server-only"
import { db } from "@/backend/db/client"
import type { SiteMe } from "@/lib/referral-site/types"
import { SiteError } from "./errors"

type MeRow = {
  address: string
  username: string
  created_at: Date
  member_number: number
  code: string
  referrer: string | null
  referrer_username: string | null
}

const SELECT_ME = (sql: ReturnType<typeof db>) => sql`
  select u.address, u.username, u.created_at, rc.code, a.referrer, ru.username as referrer_username,
    (select count(*)::int from users earlier
      where not earlier.simulated and (earlier.created_at, earlier.address) < (u.created_at, u.address)) as member_number
  from users u
  join referral_codes rc on rc.address = u.address and rc.is_current
  left join attributions a on a.referee = u.address
  left join users ru on ru.address = a.referrer
`

function toMe(row: MeRow): SiteMe {
  return {
    address: row.address,
    username: row.username,
    code: row.code,
    registeredAt: row.created_at.toISOString(),
    memberNumber: row.member_number,
    referredBy:
      row.referrer && row.referrer_username
        ? { address: row.referrer, username: row.referrer_username, displayName: row.referrer_username }
        : null,
  }
}

export async function findMeByAddress(address: string): Promise<SiteMe | null> {
  const sql = db()
  const rows = await sql<MeRow[]>`${SELECT_ME(sql)} where u.address = ${address}`
  return rows[0] ? toMe(rows[0]) : null
}

export async function findMeByPrivyUser(privyUserId: string): Promise<SiteMe | null> {
  const sql = db()
  const rows = await sql<MeRow[]>`${SELECT_ME(sql)} where u.privy_user_id = ${privyUserId}`
  return rows[0] ? toMe(rows[0]) : null
}

export async function getMe(privyUserId: string): Promise<SiteMe> {
  const me = await findMeByPrivyUser(privyUserId)
  if (!me) throw new SiteError(404, "not_registered", "This wallet has not signed up yet.")
  return me
}
