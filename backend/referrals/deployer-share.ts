import "server-only"
import Big from "big.js"

export function deployerShareFromScale(scale: string): string {
  const value = new Big(scale)
  if (value.gte(1)) return "0.5"
  return value.div(value.plus(1)).toFixed()
}
