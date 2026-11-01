import { describe, expect, it } from "vitest"
import { computeEarning, fillKey, sumEarnings, type Fill } from "./earnings"

const ctx = { attributedAt: 1000, deployerShare: "0.5", referrerRate: "0.5" }

const fill: Fill = {
  coin: "io:BTC",
  fee: "0.9",
  builderFee: "0",
  feeToken: "USDC",
  time: 2000,
  tid: 1,
}

describe("computeEarning", () => {
  it("computes the worked example", () => {
    expect(computeEarning(fill, ctx)).toEqual({
      counted: true,
      netFee: "0.9",
      entropyEarned: "0.45",
      referrerEarned: "0.225",
      referrerRate: "0.5",
    })
  })

  it("ignores coins that do not start with io:", () => {
    expect(computeEarning({ ...fill, coin: "BTC" }, ctx)).toEqual({
      counted: false,
      reason: "not_io",
    })
    expect(computeEarning({ ...fill, coin: "xio:BTC" }, ctx)).toEqual({
      counted: false,
      reason: "not_io",
    })
  })

  it("ignores fills before attribution", () => {
    expect(computeEarning({ ...fill, time: 999 }, ctx)).toEqual({
      counted: false,
      reason: "before_attribution",
    })
  })

  it("counts a fill at exactly attributedAt", () => {
    expect(computeEarning({ ...fill, time: 1000 }, ctx)).toMatchObject({ counted: true })
  })

  it("rejects non-USDC fee tokens", () => {
    expect(computeEarning({ ...fill, feeToken: "HYPE" }, ctx)).toEqual({
      counted: false,
      reason: "unsupported_fee_token",
    })
  })

  it("checks io before time before fee token", () => {
    expect(computeEarning({ ...fill, coin: "BTC", time: 1, feeToken: "HYPE" }, ctx)).toMatchObject({
      reason: "not_io",
    })
    expect(computeEarning({ ...fill, time: 1, feeToken: "HYPE" }, ctx)).toMatchObject({
      reason: "before_attribution",
    })
  })

  it("subtracts the builder fee", () => {
    expect(computeEarning({ ...fill, fee: "1", builderFee: "0.2" }, ctx)).toEqual({
      counted: true,
      netFee: "0.8",
      entropyEarned: "0.4",
      referrerEarned: "0.2",
      referrerRate: "0.5",
    })
  })

  it("applies the unlocked rate to referees attributed at or after the unlock", () => {
    const unlocked = { ...ctx, unlockedAt: 1000 }
    expect(computeEarning({ ...fill, time: 1000 }, unlocked)).toMatchObject({
      referrerRate: "0.6",
      referrerEarned: "0.27",
    })
    expect(computeEarning(fill, unlocked)).toMatchObject({ referrerRate: "0.6", referrerEarned: "0.27" })
  })

  it("keeps the base rate for referees attributed before the unlock", () => {
    const unlocked = { ...ctx, unlockedAt: 1500 }
    expect(computeEarning(fill, unlocked)).toMatchObject({ referrerRate: "0.5", referrerEarned: "0.225" })
    expect(computeEarning(fill, { ...unlocked, attributedAt: 1500 })).toMatchObject({ referrerRate: "0.6" })
    expect(computeEarning(fill, { ...unlocked, boost: { until: 3000 } })).toMatchObject({
      referrerRate: "0.75",
    })
  })

  it("treats a missing builder fee as zero", () => {
    const withoutBuilderFee: Fill = { ...fill, builderFee: undefined }
    expect(computeEarning(withoutBuilderFee, ctx)).toMatchObject({ netFee: "0.9" })
  })

  it("floors a negative maker fee at zero earnings", () => {
    expect(computeEarning({ ...fill, fee: "-0.1" }, ctx)).toEqual({
      counted: true,
      netFee: "-0.1",
      entropyEarned: "0",
      referrerEarned: "0",
      referrerRate: "0.5",
    })
  })

  it("returns zero earnings when netFee is exactly zero", () => {
    expect(computeEarning({ ...fill, fee: "0.3", builderFee: "0.3" }, ctx)).toEqual({
      counted: true,
      netFee: "0",
      entropyEarned: "0",
      referrerEarned: "0",
      referrerRate: "0.5",
    })
  })

  it("keeps sub-cent precision without exponent notation", () => {
    expect(computeEarning({ ...fill, fee: "0.000017" }, ctx)).toEqual({
      counted: true,
      netFee: "0.000017",
      entropyEarned: "0.0000085",
      referrerEarned: "0.00000425",
      referrerRate: "0.5",
    })
  })
})

describe("fillKey", () => {
  it("joins address and tid", () => {
    expect(fillKey("0xabc", 42)).toBe("0xabc:42")
  })
})

describe("sumEarnings", () => {
  it("sums decimal strings exactly", () => {
    expect(sumEarnings(["0.1", "0.2"])).toBe("0.3")
  })

  it("returns 0 for an empty list", () => {
    expect(sumEarnings([])).toBe("0")
  })

  it("keeps sub-cent precision", () => {
    expect(sumEarnings(["0.000017", "0.000003"])).toBe("0.00002")
  })
})
