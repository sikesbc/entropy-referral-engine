import { afterAll, describe, expect, it, vi } from "vitest"

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? ""
const enabled = testDatabaseUrl !== "" && testDatabaseUrl !== process.env.DATABASE_URL
if (enabled) process.env.DATABASE_URL = testDatabaseUrl
else delete process.env.DATABASE_URL

const roles = new Map<string, unknown>()
const ioTraders = new Set<string>()

vi.mock("@/backend/hyperliquid/info", async (orig) => {
  const actual = await orig<typeof import("@/backend/hyperliquid/info")>()
  return {
    ...actual,
    getUserRole: async (a: string) => roles.get(a) ?? { role: "user" },
    getSubAccounts: async () => [],
    getFillsByTime: async (a: string) =>
      ioTraders.has(a)
        ? [
            {
              coin: "io:OAI",
              px: "1",
              sz: "1",
              side: "B",
              time: 1,
              hash: "0x",
              tid: 1,
              fee: "0.1",
              feeToken: "USDC",
              crossed: true,
              dir: "Open Long",
            },
          ]
        : [],
  }
})

const { signup } = await import("@/backend/site/signup")
const { getReferrals } = await import("@/backend/site/referrals")
const { lookupReferralCode } = await import("@/backend/site/codes")
const { checkUsername } = await import("@/backend/site/usernames")
const { SiteError } = await import("@/backend/site/errors")
const { ingestFills } = await import("@/backend/sync/ingest")
const { syncAll } = await import("@/backend/sync/sync-all")
const { db } = await import("@/backend/db/client")

const hex = () =>
  "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")
const alice = hex(),
  bob = hex(),
  carol = hex(),
  dave = hex(),
  aliceBot = hex()
const all = [alice, bob, carol, dave]
const tag = Math.random().toString(16).slice(2, 8)
const names = {
  alice: `Alice_${tag}`,
  bob: `bob_${tag}`,
  carol: `carol_${tag}`,
  dave: `dave_${tag}`,
  bot: `bot_${tag}`,
  erin: `erin_${tag}`,
}
const s = (addr: string, id = "e2e:" + addr) => ({ privyUserId: id, walletAddress: addr })
const fill = (tid: number, coin: string, fee: string, time = Date.now() + 1000) => ({
  coin,
  px: "100",
  sz: "10",
  side: "B",
  time,
  hash: "0xh",
  tid,
  fee,
  feeToken: "USDC",
  crossed: true,
  dir: "Open Long",
  traderAddress: bob,
})

afterAll(async () => {
  if (!enabled) return
  const sql = db()
  await sql`delete from email_outbox where address in ${sql(all)}`
  await sql`delete from email_events where address in ${sql(all)}`
  await sql`delete from email_subscriptions where address in ${sql(all)}`
  await sql`delete from market_unlocks where address in ${sql(all)}`
  await sql`delete from earnings where referee in ${sql(all)}`
  await sql`delete from fills where address in ${sql(all)}`
  await sql`delete from attributions where referee in ${sql(all)}`
  await sql`delete from sync_state where address in ${sql(all)}`
  await sql`delete from referral_codes where address in ${sql(all)}`
  await sql`delete from users where address in ${sql(all)}`
  await sql.end()
})

describe.skipIf(!enabled)("signup, attribution and earnings against the real database", () => {
  it("runs the referral flow end to end", async () => {
    const a = await signup(s(alice), { code: null, username: names.alice })
    expect(a.status).toBe("registered")
    if (a.status !== "registered") return
    expect(a.attribution.status).toBe("no_code")
    const aliceCode = a.me.code
    expect(a.me.username).toBe(names.alice)
    expect(aliceCode).toBe(names.alice.toLowerCase())

    expect(await lookupReferralCode(aliceCode.toUpperCase())).toMatchObject({
      status: "valid",
      referrer: { address: alice, username: names.alice, displayName: names.alice },
    })
    expect((await lookupReferralCode("nobody_here")).status).toBe("unknown")
    expect(await checkUsername(names.alice.toUpperCase())).toEqual({ available: false, reason: "taken" })
    expect(await checkUsername("admin")).toEqual({ available: false, reason: "reserved" })
    expect(await checkUsername("no way")).toEqual({ available: false, reason: "invalid" })
    expect(await checkUsername(names.erin)).toEqual({ available: true })
    await expect(signup(s(hex()), { code: null, username: names.alice.toLowerCase() })).rejects.toMatchObject(
      {
        status: 409,
        code: "username_taken",
      },
    )
    await expect(signup(s(hex()), { code: null, username: "Entropy_fan" })).rejects.toMatchObject({
      status: 400,
      code: "reserved_username",
    })
    await expect(signup(s(hex()), { code: null, username: "x" })).rejects.toBeInstanceOf(SiteError)

    const b = await signup(s(bob), { code: aliceCode, username: names.bob })
    expect(b.status === "registered" && b.attribution.status).toBe("attributed")

    const b2 = await signup(s(bob), { code: aliceCode, username: names.erin })
    expect(b2.status).toBe("already_registered")

    await expect(signup(s(carol), { code: "nobody_here", username: names.carol })).rejects.toMatchObject({
      status: 400,
      code: "unknown_code",
    })
    const c = await signup(s(carol), { code: null, username: names.carol })
    expect(c.status === "registered" && c.attribution).toEqual({ status: "no_code" })

    ioTraders.add(dave)
    const d = await signup(s(dave), { code: aliceCode, username: names.dave })
    expect(d.status === "registered" && d.attribution).toMatchObject({
      status: "not_attributed",
      reason: "existing_trader",
    })

    roles.set(aliceBot, { role: "agent", data: { user: alice } })
    const ab = await signup(s(aliceBot, "e2e:bot"), {
      code: b.status === "registered" ? b.me.code : "",
      username: names.bot,
    })
    expect(ab.status).toBe("already_registered")

    const [{ attributed_at }] = await db()<
      { attributed_at: Date }[]
    >`select attributed_at from attributions where referee = ${bob}`
    const first = await ingestFills(
      bob,
      alice,
      attributed_at.getTime(),
      [
        fill(9000001, "io:OAI", "0.9"),
        fill(9000002, "xyz:GOOGL", "5"),
        fill(9000003, "io:NVDA", "-0.01"),
        fill(9000004, "io:OAI", "1", attributed_at.getTime() - 60000),
      ],
      "simulated",
    )
    const duplicate = await ingestFills(
      bob,
      alice,
      attributed_at.getTime(),
      [fill(9000001, "io:OAI", "0.9")],
      "simulated",
    )

    const synced = await syncAll({
      subAccounts: async () => [],
      fillsSince: async (address) => ({
        fills: address === bob ? [{ ...fill(9000005, "io:ANTH", "0.000017") }] : [],
        possibleGap: false,
      }),
    })

    expect(first).toEqual({ fillsInserted: 2, earningsInserted: 2 })
    expect(duplicate).toEqual({ fillsInserted: 0, earningsInserted: 0 })
    expect(synced).toMatchObject({ status: "ran", failed: 0, fillsInserted: 1, earningsInserted: 1 })
    const refs = await getReferrals("e2e:" + alice)
    expect(refs.totals).toMatchObject({ referredCount: 1, earnedUsd: "0.22500425", volumeUsd: "3000" })
    expect(refs.referrals[0].username).toBe(names.bob)
    expect(refs.referrals[0].username).toBe(names.bob)
    expect(refs.referrals[0].feesPaidUsd).toBe("0.900017")
  }, 120000)
})
