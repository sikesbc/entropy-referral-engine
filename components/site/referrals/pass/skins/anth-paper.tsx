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

type Fiber = { d: string; light: boolean; width: number }

function fibers(seed: number, count: number): Fiber[] {
  const next = rand(seed)
  return Array.from({ length: count }, () => {
    const x = next() * 900
    const y = next() * 520
    const length = 6 + next() * 22
    const angle = next() * Math.PI
    const bow = (next() - 0.5) * 8
    const dx = Math.cos(angle) * length
    const dy = Math.sin(angle) * length
    const cx = x + dx / 2 - Math.sin(angle) * bow
    const cy = y + dy / 2 + Math.cos(angle) * bow
    return {
      d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`,
      light: next() < 0.35,
      width: Number((0.4 + next() * 0.6).toFixed(2)),
    }
  })
}

const FIBERS = { body: fibers(11, 170), stub: fibers(29, 90) }

const RAYS = [
  [0, 50],
  [31, 38],
  [58, 47],
  [92, 35],
  [121, 52],
  [149, 40],
  [181, 45],
  [209, 34],
  [238, 51],
  [268, 39],
  [297, 47],
  [328, 36],
].map(([deg, length]) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return `M0 0 L${(Math.cos(rad) * length).toFixed(2)} ${(Math.sin(rad) * length).toFixed(2)}`
})

function Paper({ uid, part }: { uid: string; part: SkinPart }) {
  return (
    <svg width="900" height="520" className="absolute left-0 top-0 max-w-none" fill="none">
      <defs>
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            seed={part === "body" ? 3 : 8}
          />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.22  0.6 0 0 0 -0.24" />
        </filter>
        <filter id={`${uid}-cloud`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves="3"
            seed={part === "body" ? 5 : 2}
          />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0.4 0 0 0 -0.14" />
        </filter>
      </defs>
      <rect width="900" height="520" filter={`url(#${uid}-cloud)`} />
      <rect width="900" height="520" filter={`url(#${uid}-grain)`} />
      <g strokeLinecap="round">
        {FIBERS[part].map((fiber, i) => (
          <path
            key={i}
            d={fiber.d}
            stroke={fiber.light ? "rgb(255 255 255 / 0.75)" : "rgb(132 104 66 / 0.24)"}
            strokeWidth={fiber.width}
          />
        ))}
      </g>
    </svg>
  )
}

function Deboss({ uid }: { uid: string }) {
  return (
    <svg
      viewBox="-60 -60 120 120"
      className="absolute right-[-14%] top-[56%] aspect-square h-[92%] -translate-y-1/2 max-w-none"
      fill="none"
    >
      <defs>
        <g id={`${uid}-spark`} strokeWidth={7} strokeLinecap="round">
          {RAYS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <filter id={`${uid}-press`} x="-20%" y="-20%" width="140%" height="140%">
          <feOffset in="SourceAlpha" dx="0.45" dy="0.6" result="off" />
          <feGaussianBlur in="off" stdDeviation="0.45" result="blur" />
          <feComposite in="SourceAlpha" in2="blur" operator="out" result="rim" />
          <feFlood floodColor="#5e4527" floodOpacity="0.4" />
          <feComposite in2="rim" operator="in" result="shadow" />
          <feOffset in="SourceAlpha" dx="-0.45" dy="-0.6" result="offLight" />
          <feGaussianBlur in="offLight" stdDeviation="0.45" result="blurLight" />
          <feComposite in="SourceAlpha" in2="blurLight" operator="out" result="rimLight" />
          <feFlood floodColor="#ffffff" floodOpacity="0.85" />
          <feComposite in2="rimLight" operator="in" result="light" />
          <feFlood floodColor="#6e5532" floodOpacity="0.06" />
          <feComposite in2="SourceAlpha" operator="in" result="floor" />
          <feMerge>
            <feMergeNode in="floor" />
            <feMergeNode in="light" />
            <feMergeNode in="shadow" />
          </feMerge>
        </filter>
      </defs>
      <use href={`#${uid}-spark`} stroke="#000" filter={`url(#${uid}-press)`} />
    </svg>
  )
}

export function AnthArt({ part }: { part: SkinPart }) {
  const uid = `an${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Paper uid={uid} part={part} />
      {part === "body" ? <Deboss uid={uid} /> : null}
    </span>
  )
}
