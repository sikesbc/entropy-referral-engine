import type { Skin, SkinPart } from "./types"

const S = '.pass-card[data-skin="EWY"]'

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Fiber = { d: string; stroke: string; width: number; opacity: number }
type Fleck = { cx: number; cy: number; rx: number; ry: number; rotate: number; opacity: number }

function fibers(seed: number, count: number, width: number, height: number): Fiber[] {
  const random = seeded(seed)
  const out: Fiber[] = []
  for (let index = 0; index < count; index++) {
    let x = random() * width
    let y = random() * height
    let angle = random() * Math.PI * 2
    const length = 50 + random() * random() * 320
    const steps = 3 + Math.floor(random() * 3)
    const step = length / steps
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`
    for (let segment = 0; segment < steps; segment++) {
      angle += (random() - 0.5) * 1.1
      const cx = x + Math.cos(angle) * step * 0.5
      const cy = y + Math.sin(angle) * step * 0.5
      angle += (random() - 0.5) * 0.9
      x = cx + Math.cos(angle) * step * 0.5
      y = cy + Math.sin(angle) * step * 0.5
      d += `Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
    }
    const kind = random()
    if (kind < 0.5) {
      out.push({ d, stroke: "#a58a58", width: 0.35 + random() * 0.5, opacity: 0.22 + random() * 0.25 })
    } else if (kind < 0.85) {
      out.push({ d, stroke: "#fffaf0", width: 0.6 + random() * 0.9, opacity: 0.55 + random() * 0.35 })
    } else {
      out.push({ d, stroke: "#7d6638", width: 0.3 + random() * 0.3, opacity: 0.18 + random() * 0.18 })
    }
  }
  return out
}

function flecks(seed: number, count: number, width: number, height: number): Fleck[] {
  const random = seeded(seed)
  return Array.from({ length: count }, () => ({
    cx: random() * width,
    cy: random() * height,
    rx: 0.6 + random() * 1.6,
    ry: 0.3 + random() * 0.5,
    rotate: random() * 180,
    opacity: 0.25 + random() * 0.35,
  }))
}

const FIBERS: Record<SkinPart, Fiber[]> = {
  body: fibers(11, 240, 1000, 640),
  stub: fibers(29, 120, 1000, 320),
}

const FLECKS: Record<SkinPart, Fleck[]> = {
  body: flecks(5, 14, 1000, 640),
  stub: flecks(17, 7, 1000, 320),
}

const RED = "M12 112A100 100 0 0 1 212 112A50 50 0 0 0 112 112A50 50 0 0 1 12 112Z"
const BLUE = "M12 112A100 100 0 0 0 212 112A50 50 0 0 0 112 112A50 50 0 0 1 12 112Z"

function Paper({ part }: { part: SkinPart }) {
  return (
    <svg className="absolute inset-0 h-full w-full">
      <defs>
        <filter id={`ewy-cloud-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.011"
            numOctaves="4"
            seed={part === "body" ? 3 : 8}
          />
          <feColorMatrix values="0 0 0 0 0.52  0 0 0 0 0.42  0 0 0 0 0.26  1.9 0 0 0 -0.82" />
        </filter>
        <filter id={`ewy-light-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.03"
            numOctaves="3"
            seed={part === "body" ? 14 : 21}
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.99  0 0 0 0 0.96  2.4 0 0 0 -1.3" />
        </filter>
        <filter id={`ewy-grain-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="2" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.15  2.6 0 0 0 -1.25" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#ewy-cloud-${part})`} opacity="0.5" />
      <rect width="100%" height="100%" filter={`url(#ewy-light-${part})`} opacity="0.7" />
      <g fill="none" strokeLinecap="round">
        {FIBERS[part].map((fiber, index) => (
          <path
            key={index}
            d={fiber.d}
            stroke={fiber.stroke}
            strokeWidth={fiber.width}
            strokeOpacity={fiber.opacity}
          />
        ))}
      </g>
      <g fill="#4a3517">
        {FLECKS[part].map((fleck, index) => (
          <ellipse
            key={index}
            cx={fleck.cx.toFixed(1)}
            cy={fleck.cy.toFixed(1)}
            rx={fleck.rx.toFixed(2)}
            ry={fleck.ry.toFixed(2)}
            opacity={fleck.opacity.toFixed(2)}
            transform={`rotate(${fleck.rotate.toFixed(0)} ${fleck.cx.toFixed(1)} ${fleck.cy.toFixed(1)})`}
          />
        ))}
      </g>
      <rect width="100%" height="100%" filter={`url(#ewy-grain-${part})`} opacity="0.35" />
    </svg>
  )
}

function Taegeuk() {
  return (
    <svg viewBox="0 0 224 224" className="ewy-taegeuk absolute">
      <defs>
        <filter id="ewy-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="warp" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="3.5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="3" seed="9" result="grain" />
          <feColorMatrix
            in="grain"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 2.75"
            result="holes"
          />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter="url(#ewy-ink)" transform="rotate(33.69 112 112)">
        <path d={RED} fill="#c8303b" />
        <path d={BLUE} fill="#1e4b9b" transform="translate(1.4 0.9)" />
      </g>
    </svg>
  )
}

function Seal() {
  return (
    <svg viewBox="0 0 40 40" className="ewy-seal absolute">
      <defs>
        <filter id="ewy-seal-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="12" result="grain" />
          <feColorMatrix in="grain" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 0 0 2.35" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter="url(#ewy-seal-ink)" fill="#c8303b">
        <path
          fillRule="evenodd"
          d="M3 4.5Q3 3 4.5 3H35.5Q37 3 37 4.5V35.5Q37 37 35.5 37H4.5Q3 37 3 35.5ZM6 6V34H34V6Z"
        />
        <path d="M10 10H30V12.6H10ZM10 27.4H30V30H10ZM18.7 13H21.3V27H18.7ZM10 18.6H17.4V21.2H10ZM22.6 18.6H30V21.2H22.6Z" />
      </g>
    </svg>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Paper part={part} />
      {part === "body" ? <Taegeuk /> : <Seal />}
    </span>
  )
}

const css = `
${S} {
  --ink: #1d1b18;
  --qr-bg: #f8f4ea;
}
${S} .pass-face {
  background-color: #eee5d1;
  background-image:
    radial-gradient(120% 90% at 12% 8%, rgb(255 252 244 / 0.75), rgb(255 252 244 / 0) 60%),
    radial-gradient(90% 80% at 92% 100%, rgb(190 168 124 / 0.28), rgb(190 168 124 / 0) 65%),
    repeating-linear-gradient(90deg, rgb(120 96 60 / 0.05) 0 1px, rgb(120 96 60 / 0) 1px 44px),
    repeating-linear-gradient(0deg, rgb(120 96 60 / 0.03) 0 1px, rgb(120 96 60 / 0) 1px 3px),
    linear-gradient(180deg, #f3ecdc 0%, #e8ddc6 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    inset 0 0 0 1px rgb(120 96 60 / 0.14),
    inset 0 -14px 28px -22px rgb(90 70 40 / 0.4);
}
${S} .pass-brand {
  filter: invert(1);
}
${S} .pass-market-logo {
  box-shadow: 0 0 0 1px rgb(60 45 20 / 0.18), 0 1px 2px rgb(60 45 20 / 0.2);
}
${S} .pass-perf {
  border-color: rgb(90 66 30 / 0.4);
}
${S} .pass-qr {
  filter: drop-shadow(0 0 0.5px rgb(90 66 30 / 0.35));
}
${S} .pass-sheen {
  mix-blend-mode: soft-light;
}
${S} .ewy-taegeuk {
  top: -4.6rem;
  right: -2.4rem;
  width: 12.6rem;
  height: 12.6rem;
  mix-blend-mode: multiply;
  opacity: 0.92;
}
${S} .ewy-seal {
  right: 1.5rem;
  bottom: 0.45rem;
  width: 1.8rem;
  height: 1.8rem;
  transform: rotate(-4deg);
  mix-blend-mode: multiply;
  opacity: 0.85;
}
${S}[data-state="locked"] .pass-face {
  filter: grayscale(1) brightness(0.94) contrast(0.92);
}
${S}[data-state="locked"] .pass-face::after {
  background: rgb(232 226 212 / 0.45);
}
${S}[data-state="boosted"] .pass-face::after {
  mix-blend-mode: multiply;
  opacity: 0.4;
  background: linear-gradient(115deg, #0000 20%, #f6b7c6 34%, #b9d4f7 46%, #f7e3a8 58%, #f6b7c6 68%, #0000 82%) 0 0 / 250% 100%;
}
`

export const ewySkin: Skin = {
  id: "EWY",
  name: "South Korea",
  logo: "/logos/io_EWY.png",
  css,
  Art,
}
