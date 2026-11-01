import Big from "big.js"
import type { MarketBoost } from "./market-programs"
import type { RecentTrade, ReferredTrader, Referrer, SiteMe } from "./types"

export const DEMO_ADDRESS = "0x7a3f9c2e41b8d6f05e2a9b13c4d8e7f6a1b2c3d4"

export const DEMO_ME: SiteMe = {
  address: DEMO_ADDRESS,
  username: "Bright_Falcon",
  code: "bright_falcon",
  registeredAt: "2026-08-21T09:12:00Z",
  memberNumber: 41,
  referredBy: null,
}

export const DEMO_UNKNOWN_CODE = "misty_lynx"

export const DEMO_TAKEN_USERNAMES = ["ben", "nightowl", "swift_otter", "bright_falcon"]

export const KNOWN_CODES: Record<string, Referrer> = {
  swift_otter: {
    address: "0x51c28d7e0f3a4b96c1d2e8f7a0b3c4d5e6f7e9a0",
    username: "Swift_Otter",
    displayName: "Swift_Otter",
  },
  nightowl: {
    address: "0xb4e07c19d2a35f68e1c0d9b8a7f6e5d4c3b2a1f8",
    username: "nightowl",
    displayName: "nightowl",
  },
}

export type DemoReferral = Omit<ReferredTrader, "lastTradeAt"> & { lastTradeAgeMs: number | null }

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

export const DEMO_REFERRALS: DemoReferral[] = [
  {
    address: "0x3b9e1f04c7d2a85e6b3c0f9d8e7a6b5c4d3e2f10",
    username: "marmot_91",
    joinedAt: "2026-09-02T14:05:00Z",
    firstTradeAt: "2026-09-02T14:31:00Z",
    lastTradeAgeMs: 3 * MINUTE_MS,
    volumeUsd: "1284530.12",
    feesPaidUsd: "642.265060",
    earnedUsd: "160.566265",
  },
  {
    address: "0x91d45a2b8c7e3f06d1e9a4b7c2f8e5d0a3b6c9e2",
    username: "Calm_Heron",
    joinedAt: "2026-09-14T08:47:00Z",
    firstTradeAt: "2026-09-15T11:02:00Z",
    lastTradeAgeMs: 41 * MINUTE_MS,
    volumeUsd: "412908.55",
    feesPaidUsd: "185.808847",
    earnedUsd: "43.32721175",
  },
  {
    address: "0xc07a6e3d9b1f2c48a5e0d7b3f9c1e6a8d2b4f7e5",
    username: "trader_4f2a9c",
    joinedAt: "2026-10-03T19:20:00Z",
    firstTradeAt: "2026-10-04T07:15:00Z",
    lastTradeAgeMs: 27 * HOUR_MS,
    volumeUsd: "58210.00",
    feesPaidUsd: "26.194500",
    earnedUsd: "6.548625",
  },
  {
    address: "0x2f61b8e4d0c3a97f5e1b6d2c8a4f0e9b3d7c1a6f",
    username: "quokka",
    joinedAt: "2026-10-19T22:38:00Z",
    firstTradeAt: "2026-10-20T00:04:00Z",
    lastTradeAgeMs: 3 * DAY_MS,
    volumeUsd: "31.40",
    feesPaidUsd: "0.016956",
    earnedUsd: "0.004239",
  },
  {
    address: "0xe4b8c2f9a1d6e03b7c5f8a2d9e6b1c4f7a0d3e8b",
    username: "Lynx_Lee",
    joinedAt: "2026-10-26T16:10:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
  {
    address: "0x6d20f7a3c9e1b84d2f6a0c5e8b3d7f1a4c9e2b6d",
    username: "trader_b07d31",
    joinedAt: "2026-10-28T10:55:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
  {
    address: "0x7ac39f43d24648df5100a3c3be680d4530b5ee71",
    username: "Amber_Kite",
    joinedAt: "2026-09-05T10:22:00Z",
    firstTradeAt: "2026-09-05T13:48:00Z",
    lastTradeAgeMs: 9 * DAY_MS + 4 * HOUR_MS,
    volumeUsd: "864215.30",
    feesPaidUsd: "432.107650",
    earnedUsd: "108.026913",
  },
  {
    address: "0xb296040299005f629484e86da35405e81c1f2ee7",
    username: "zk_moth",
    joinedAt: "2026-09-09T03:14:00Z",
    firstTradeAt: "2026-09-11T21:40:00Z",
    lastTradeAgeMs: 6 * DAY_MS + 11 * HOUR_MS,
    volumeUsd: "2410.75",
    feesPaidUsd: "1.301805",
    earnedUsd: "0.325451",
  },
  {
    address: "0xeff5a40d01a49e1016b9b81d67673a00c9abd019",
    username: "trader_7c0a12",
    joinedAt: "2026-09-12T15:27:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
  {
    address: "0x8bef8700c6528f407cc28a57b98786c55f8f0cf7",
    username: "Quiet_Badger",
    joinedAt: "2026-09-18T17:36:00Z",
    firstTradeAt: "2026-09-20T09:05:00Z",
    lastTradeAgeMs: 4 * DAY_MS + 5 * HOUR_MS,
    volumeUsd: "197430.60",
    feesPaidUsd: "88.843770",
    earnedUsd: "22.210943",
  },
  {
    address: "0x8cb1dbc3d4dbf896bd146f8588913294e599e84d",
    username: "trader_e19c55",
    joinedAt: "2026-09-23T12:01:00Z",
    firstTradeAt: "2026-09-23T12:44:00Z",
    lastTradeAgeMs: 8 * DAY_MS + 2 * HOUR_MS,
    volumeUsd: "940.00",
    feesPaidUsd: "0.507600",
    earnedUsd: "0.126900",
  },
  {
    address: "0xaecd355e8105e6ba7c95b7423a48ef96808777d8",
    username: "delta_neutral",
    joinedAt: "2026-09-27T20:50:00Z",
    firstTradeAt: "2026-09-28T08:12:00Z",
    lastTradeAgeMs: 3 * DAY_MS + 14 * HOUR_MS,
    volumeUsd: "73305.85",
    feesPaidUsd: "35.186808",
    earnedUsd: "8.796702",
  },
  {
    address: "0x0510b19c0d374070db174e10e45d990a42661816",
    username: "Red_Tern",
    joinedAt: "2026-09-30T06:52:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
  {
    address: "0xbf319bbbed300869437f19dc73a8e842dc0c1a1f",
    username: "Swift_Ibis",
    joinedAt: "2026-10-01T07:30:00Z",
    firstTradeAt: "2026-10-08T15:26:00Z",
    lastTradeAgeMs: 7 * DAY_MS + 7 * HOUR_MS,
    volumeUsd: "12680.20",
    feesPaidUsd: "6.340100",
    earnedUsd: "1.585025",
  },
  {
    address: "0xed00e478c973ac6ba4c0dc8e95669c086e694154",
    username: "ferrous",
    joinedAt: "2026-10-07T14:18:00Z",
    firstTradeAt: "2026-10-07T14:52:00Z",
    lastTradeAgeMs: 4 * DAY_MS,
    volumeUsd: "309555.10",
    feesPaidUsd: "139.299795",
    earnedUsd: "34.824949",
  },
  {
    address: "0xa436515a00d448a74f297994b80a2d933ca54fd8",
    username: "basis_bob",
    joinedAt: "2026-10-09T21:11:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
  {
    address: "0x8825c52061cf711a53203af5ce675b9b883baed2",
    username: "gm_kestrel",
    joinedAt: "2026-10-11T09:43:00Z",
    firstTradeAt: "2026-10-12T18:20:00Z",
    lastTradeAgeMs: 10 * DAY_MS + 3 * HOUR_MS,
    volumeUsd: "4820.65",
    feesPaidUsd: "2.313912",
    earnedUsd: "0.578478",
  },
  {
    address: "0x7f3194d6432153e195403ec1029dd9affce7cd14",
    username: "nori_88",
    joinedAt: "2026-10-15T23:07:00Z",
    firstTradeAt: "2026-10-17T02:33:00Z",
    lastTradeAgeMs: 9 * DAY_MS + 20 * HOUR_MS,
    volumeUsd: "152.30",
    feesPaidUsd: "0.082242",
    earnedUsd: "0.020561",
  },
  {
    address: "0xeead6ab81dd1596968add0a4bd0bcea0ef1b1510",
    username: "Cold_Mink",
    joinedAt: "2026-10-17T13:34:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
  {
    address: "0xe9a4750fcb38734e1a4d2f0543ae2611720d4fee",
    username: "Iron_Stoat",
    joinedAt: "2026-10-22T11:15:00Z",
    firstTradeAt: "2026-10-22T11:58:00Z",
    lastTradeAgeMs: 5 * DAY_MS + 1 * HOUR_MS,
    volumeUsd: "26990.00",
    feesPaidUsd: "13.495000",
    earnedUsd: "3.373750",
  },
  {
    address: "0x7bc6c2cdd19575b18cc156178f2a51c1cac2045e",
    username: "Pale_Wren",
    joinedAt: "2026-10-24T18:40:00Z",
    firstTradeAt: "2026-10-25T10:09:00Z",
    lastTradeAgeMs: 4 * DAY_MS + 2 * HOUR_MS,
    volumeUsd: "1105.80",
    feesPaidUsd: "0.530784",
    earnedUsd: "0.132696",
  },
  {
    address: "0x4fe072de13566cc58549849968d7e24d68cae1c2",
    username: "trader_52fd8e",
    joinedAt: "2026-10-29T08:20:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
  {
    address: "0x82d65f90bfed4d739c93950c250da21469b60a19",
    username: "Dusk_Vole",
    joinedAt: "2026-10-30T19:45:00Z",
    firstTradeAt: null,
    lastTradeAgeMs: null,
    volumeUsd: "0",
    feesPaidUsd: "0",
    earnedUsd: "0",
  },
]

export const DEMO_TOTALS = {
  earnedUsd: DEMO_REFERRALS.reduce((sum, trader) => sum.plus(trader.earnedUsd), new Big(0)).toString(),
  volumeUsd: DEMO_REFERRALS.reduce((sum, trader) => sum.plus(trader.volumeUsd), new Big(0)).toString(),
}

const MARMOT = DEMO_REFERRALS[0]
const HERON = DEMO_REFERRALS[1]
const TROUT = DEMO_REFERRALS[2]
const QUOKKA = DEMO_REFERRALS[3]

type DemoTradeTemplate = Omit<RecentTrade, "time"> & { ageMs: number }

export const DEMO_RECENT_TRADES: DemoTradeTemplate[] = [
  {
    tid: "1790000000001",
    ageMs: 3 * MINUTE_MS,
    address: MARMOT.address,
    username: MARMOT.username,
    coin: "io:SNDK",
    side: "buy",
    sizeUsd: "30253.4271",
    feeUsd: "2.722808",
    earnedUsd: "0.680702",
  },
  {
    tid: "1790000000002",
    ageMs: 41 * MINUTE_MS,
    address: HERON.address,
    username: HERON.username,
    coin: "io:NVDA",
    side: "sell",
    sizeUsd: "8412.9",
    feeUsd: "-0.084129",
    earnedUsd: "0",
  },
  {
    tid: "1790000000003",
    ageMs: 5 * 60 * MINUTE_MS,
    address: MARMOT.address,
    username: MARMOT.username,
    coin: "io:ANTH",
    side: "sell",
    sizeUsd: "12980.55",
    feeUsd: "1.168250",
    earnedUsd: "0.292062",
  },
  {
    tid: "1790000000004",
    ageMs: 27 * 60 * MINUTE_MS,
    address: TROUT.address,
    username: TROUT.username,
    coin: "io:OAI",
    side: "buy",
    sizeUsd: "2910.04",
    feeUsd: "0.261904",
    earnedUsd: "0.065476",
  },
  {
    tid: "1790000000005",
    ageMs: 3 * 24 * 60 * MINUTE_MS,
    address: QUOKKA.address,
    username: QUOKKA.username,
    coin: "io:GPRO",
    side: "buy",
    sizeUsd: "31.40",
    feeUsd: "0.016956",
    earnedUsd: "0.004239",
  },
]

type DemoMarketSeed = { coin: string; ownVolumeUsd: string; unlockedAt?: string; boost?: MarketBoost }

export const DEMO_MARKET_SEEDS: DemoMarketSeed[] = [
  { coin: "io:NVDA", ownVolumeUsd: "18450.20", unlockedAt: "2026-09-18T15:42:00Z" },
  { coin: "io:ANTH", ownVolumeUsd: "6320.75", boost: { until: "2026-11-15T00:00:00Z" } },
  { coin: "io:OAI", ownVolumeUsd: "12980.00", unlockedAt: "2026-10-06T11:08:00Z" },
  { coin: "io:SNDK", ownVolumeUsd: "7100" },
  { coin: "io:DRAM", ownVolumeUsd: "3860.40" },
  { coin: "io:IONQ", ownVolumeUsd: "1900" },
  { coin: "io:NBIS", ownVolumeUsd: "2450.10" },
  { coin: "io:EWY", ownVolumeUsd: "480" },
  { coin: "io:GPRO", ownVolumeUsd: "0" },
  { coin: "io:TCNT", ownVolumeUsd: "1120.65" },
  { coin: "io:XIAOMI", ownVolumeUsd: "0" },
  { coin: "io:PRL", ownVolumeUsd: "3290" },
]

export const DEMO_EMPTY_MARKET_BOOSTS: Record<string, MarketBoost> = {
  "io:ANTH": { until: "2026-11-15T00:00:00Z" },
}
