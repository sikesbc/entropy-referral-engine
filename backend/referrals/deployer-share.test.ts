import { describe, expect, it } from "vitest"
import { deployerShareFromScale } from "./deployer-share"

describe("deployerShareFromScale", () => {
  it("is scale / (1 + scale) below 1", () => {
    expect(deployerShareFromScale("0.25")).toBe("0.2")
    expect(deployerShareFromScale("0.5")).toBe("0.33333333333333333333")
  })

  it("is 0 when scale is 0", () => {
    expect(deployerShareFromScale("0")).toBe("0")
  })

  it("is 0.5 at exactly 1", () => {
    expect(deployerShareFromScale("1")).toBe("0.5")
  })

  it("is 0.5 above 1", () => {
    expect(deployerShareFromScale("2")).toBe("0.5")
    expect(deployerShareFromScale("100.5")).toBe("0.5")
  })
})
