import "server-only"
import { db } from "@/backend/db/client"
import { isValidCode, normalizeCode } from "@/backend/referrals/codes"
import type { CodeLookup } from "@/lib/referral-site/types"

export async function lookupReferralCode(input: string): Promise<CodeLookup> {
  const code = normalizeCode(input)
  if (!isValidCode(code)) return { code, status: "unknown" }
  const rows = await db()<{ address: string; username: string; member_number: number }[]>`
    select rc.address, u.username,
      (select count(*)::int from users earlier
        where not earlier.simulated and (earlier.created_at, earlier.address) < (u.created_at, u.address)) as member_number
    from referral_codes rc
    join users u on u.address = rc.address
    where rc.code = ${code}
  `
  const row = rows[0]
  return row
    ? {
        code,
        status: "valid",
        referrer: { address: row.address, username: row.username, displayName: row.username },
        memberNumber: row.member_number,
      }
    : { code, status: "unknown" }
}
