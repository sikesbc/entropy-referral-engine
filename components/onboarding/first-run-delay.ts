import type { CSSProperties } from "react"

export function firstRunDelay(ms: number): CSSProperties {
  return { "--first-run-delay": `${ms}ms` } as CSSProperties
}
