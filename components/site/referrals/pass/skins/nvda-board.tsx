import { useId } from "react"
import type { SkinPart } from "./types"

const TRACE = "rgb(140 205 104 / 0.3)"
const SILK = "rgb(244 247 240 / 0.62)"
const PITCH = 15
const COLS = 11
const ROWS = 10
const GRID_X = 852
const GRID_Y = -6

function busLeft(): string[] {
  return Array.from({ length: 8 }, (_, i) => {
    const y = 14 + i * 8
    const bend = 760 + i * 3.31
    const drop = 200
    return `M846 ${y} H${bend.toFixed(2)} L${(bend - drop).toFixed(2)} ${y + drop} H-10`
  })
}

function busDown(): string[] {
  return Array.from({ length: 6 }, (_, j) => {
    const x = 870 + j * 8
    const bend = 300 + j * 3.31
    const run = 120
    return `M${x} 132 V${bend.toFixed(2)} L${x - run} ${(bend + run).toFixed(2)} V700`
  })
}

function pads(): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (col >= 3 && col <= 7 && row >= 2 && row <= 6) continue
      out.push({ x: GRID_X + col * PITCH, y: GRID_Y + row * PITCH })
    }
  }
  return out
}

const LEFT = busLeft()
const DOWN = busDown()
const PADS = pads()
const PULSES = [LEFT[1], LEFT[4], LEFT[6], DOWN[0], DOWN[3]]
const VIAS = [
  [968, 250],
  [986, 268],
  [968, 286],
  [988, 340],
  [712, 414],
  [730, 414],
  [748, 414],
]
const CAPS = [175, 193, 211, 229]

function Body({ uid }: { uid: string }) {
  const gold = `${uid}-gold`
  return (
    <svg width="1000" height="700" className="absolute right-0 top-0 max-w-none" fill="none">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fbe7a2" />
          <stop offset="0.45" stopColor="#d6aa4c" />
          <stop offset="1" stopColor="#9a7024" />
        </linearGradient>
      </defs>
      <g stroke={TRACE} strokeWidth={3.2} strokeLinejoin="round">
        {[...LEFT, ...DOWN].map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g stroke="rgb(210 255 160 / 0.08)" strokeWidth={1}>
        {[...LEFT, ...DOWN].map((d, i) => (
          <path key={i} d={d} transform="translate(-0.6 -0.8)" />
        ))}
      </g>
      <g className="nvda-pulse" stroke="#c8ff6b" strokeWidth={2.2} strokeLinecap="round">
        {PULSES.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1000}
            strokeDasharray="36 964"
            style={{
              animationDelay: `${-(((i * 0.618) % 1) * 2.6).toFixed(2)}s`,
              filter: "drop-shadow(0 0 3px #9dff3a)",
            }}
          />
        ))}
      </g>
      <rect x={838} y={-20} width={178} height={160} stroke={SILK} strokeWidth={1.2} />
      <path d="M838 128 L850 140 H838 Z" fill={SILK} />
      <rect x={889.5} y={16.5} width={75} height={75} stroke={SILK} strokeWidth={1} strokeDasharray="4 3" />
      <g>
        {PADS.map(({ x, y }) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={4.6} fill="#06260f" opacity={0.55} />
            <circle cx={x} cy={y} r={3.4} fill={`url(#${gold})`} />
          </g>
        ))}
      </g>
      {CAPS.map((y) => (
        <g key={y}>
          <rect x={934} y={y} width={4} height={5} rx={0.6} fill={`url(#${gold})`} />
          <rect x={938.5} y={y + 0.4} width={5} height={4.2} fill="#b8946a" opacity={0.85} />
          <rect x={944} y={y} width={4} height={5} rx={0.6} fill={`url(#${gold})`} />
        </g>
      ))}
      {VIAS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={3.4} fill={`url(#${gold})`} />
          <circle cx={x} cy={y} r={1.4} fill="#04170a" />
        </g>
      ))}
      <circle cx={978} cy={396} r={6.5} fill="#0a3a1d" stroke="rgb(0 0 0 / 0.25)" />
      <circle cx={978} cy={396} r={3} fill={`url(#${gold})`} />
    </svg>
  )
}

function Stub({ uid }: { uid: string }) {
  const gold = `${uid}-fgold`
  const tile = `${uid}-fingers`
  return (
    <svg className="absolute bottom-0 left-[1.6rem] h-[22px] w-[calc(100%-3.2rem)]" fill="none">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe7a2" />
          <stop offset="0.5" stopColor="#d6aa4c" />
          <stop offset="1" stopColor="#a47a2a" />
        </linearGradient>
        <pattern id={tile} width="24" height="22" patternUnits="userSpaceOnUse">
          <path d="M6 12 V2 M18 12 V6" stroke={TRACE} strokeWidth={2.4} />
          <rect x={2} y={11} width={8} height={14} rx={1.2} fill={`url(#${gold})`} />
          <rect x={14} y={11} width={8} height={14} rx={1.2} fill={`url(#${gold})`} />
        </pattern>
      </defs>
      <rect width="100%" height="22" fill={`url(#${tile})`} />
    </svg>
  )
}

export function NvdaArt({ part }: { part: SkinPart }) {
  const uid = `nv${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {part === "body" ? <Body uid={uid} /> : <Stub uid={uid} />}
    </span>
  )
}
