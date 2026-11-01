import { useId } from "react"
import type { SkinPart } from "./types"

function rand(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TINTS = ["#f7cfdf", "#d6d1f7", "#c8ede2", "#f6e2c2", "#cfe1f7", "#ecd0f2"]

type Wave = (x: number) => number

function waveAt(base: number, next: () => number): Wave {
  const a1 = 4 + next() * 10
  const a2 = 1 + next() * 3
  const f1 = 0.008 + next() * 0.01
  const f2 = 0.03 + next() * 0.03
  const p1 = next() * Math.PI * 2
  const p2 = next() * Math.PI * 2
  return (x) => base + a1 * Math.sin(x * f1 + p1) + a2 * Math.sin(x * f2 + p2)
}

function trace(wave: Wave, from: number, to: number, step: number): string[] {
  const points: string[] = []
  for (let x = from; x <= to; x += step) points.push(`${x} ${wave(x).toFixed(1)}`)
  return points
}

function nacre(seed: number) {
  const next = rand(seed)
  const edges: Wave[] = []
  let y = -260
  while (y < 660) {
    edges.push(waveAt(y, next))
    y += 18 + next() * 40
  }
  const bands = edges.slice(0, -1).map((top, i) => {
    const upper = trace(top, -300, 700, 20)
    const lower = trace(edges[i + 1], -300, 700, 20).reverse()
    return {
      d: `M${upper.join(" L")} L${lower.join(" L")} Z`,
      fill: TINTS[i % TINTS.length],
      opacity: 0.18 + next() * 0.36,
    }
  })
  const lines = edges.flatMap((edge, i) => {
    const out: { d: string; light: boolean }[] = []
    if (i % 2 === 1) out.push({ d: `M${trace(edge, -300, 700, 20).join(" L")}`, light: true })
    if (i % 3 === 0) {
      const shifted: Wave = (x) => edge(x) + 4 + next() * 3
      out.push({ d: `M${trace(shifted, -300, 700, 20).join(" L")}`, light: false })
    }
    return out
  })
  return { bands, lines }
}

const SHELL = { body: nacre(17), stub: nacre(41) }

export function PrlArt({ part }: { part: SkinPart }) {
  const uid = `pr${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const shell = SHELL[part]
  const tilt = part === "body" ? "rotate(-24 200 200)" : "rotate(-14 200 200)"
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id={`${uid}-soft`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g transform={tilt}>
          <g filter={`url(#${uid}-soft)`}>
            {shell.bands.map((band, i) => (
              <path key={i} d={band.d} fill={band.fill} opacity={band.opacity} />
            ))}
          </g>
          <g fill="none">
            {shell.lines.map((line, i) => (
              <path
                key={i}
                d={line.d}
                stroke={line.light ? "rgb(255 255 255 / 0.55)" : "rgb(110 96 140 / 0.12)"}
                strokeWidth={line.light ? 0.9 : 0.6}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </g>
      </svg>
      <span className="prl-lustre absolute inset-0" />
    </span>
  )
}
