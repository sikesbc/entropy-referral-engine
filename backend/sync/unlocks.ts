import "server-only"
import { db } from "@/backend/db/client"
import { notifyUnlocks } from "@/backend/email/notify"
import { findUnlockCrossings, type VolumeFill } from "./unlock-crossing"

export async function recordUnlocks(address: string): Promise<number> {
  const sql = db()
  const rows = await sql<{ coin: string; time: Date; tid: string; px: string; sz: string }[]>`
    select coin, time, tid::text as tid, px::text as px, sz::text as sz
    from fills
    where address = ${address} and coin like 'io:%'
  `
  const fills: VolumeFill[] = rows.map((row) => ({
    coin: row.coin,
    time: row.time.getTime(),
    tid: Number(row.tid),
    px: row.px,
    sz: row.sz,
  }))
  const crossings = [...findUnlockCrossings(fills)]
  if (crossings.length === 0) return 0
  const values = crossings.map(([coin, time]) => ({ address, coin, unlocked_at: new Date(time) }))
  const inserted = await sql<{ coin: string }[]>`
    insert into market_unlocks ${sql(values, "address", "coin", "unlocked_at")}
    on conflict (address, coin) do nothing
    returning coin
  `
  await notifyUnlocks(
    address,
    inserted.map((row) => row.coin),
  )
  return inserted.length
}
