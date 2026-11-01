import type { Skin, SkinPart } from "./types"

const S = '.pass-card[data-skin="XIAOMI"]'

function squircle(radius: number, exponent: number, cx: number, cy: number): string {
  const points: string[] = []
  const steps = 96
  for (let index = 0; index < steps; index++) {
    const angle = (index / steps) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const x = cx + radius * Math.sign(cos) * Math.abs(cos) ** (2 / exponent)
    const y = cy + radius * Math.sign(sin) * Math.abs(sin) ** (2 / exponent)
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `M${points.join("L")}Z`
}

const OUTER = squircle(110, 3, 120, 120)
const INNER = squircle(96, 3, 120, 120)

function Brushed({ part }: { part: SkinPart }) {
  return (
    <svg className="absolute inset-0 h-full w-full">
      <defs>
        <filter id={`xiaomi-hair-light-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0022 0.62"
            numOctaves="2"
            seed={part === "body" ? 5 : 13}
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.2 0 0 0 -1.65" />
        </filter>
        <filter id={`xiaomi-hair-dark-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.003 0.8"
            numOctaves="2"
            seed={part === "body" ? 22 : 27}
          />
          <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.13  0 0 0 0 0.15  -3.2 0 0 0 1.55" />
        </filter>
        <filter id={`xiaomi-grain-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.21  0 0 0 0 0.23  2.4 0 0 0 -1.1" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#xiaomi-hair-light-${part})`} opacity="0.55" />
      <rect width="100%" height="100%" filter={`url(#xiaomi-hair-dark-${part})`} opacity="0.32" />
      <rect width="100%" height="100%" filter={`url(#xiaomi-grain-${part})`} opacity="0.16" />
    </svg>
  )
}

function Engraving() {
  return (
    <svg viewBox="0 0 240 240" className="xiaomi-squircle absolute">
      <g fill="none">
        {[OUTER, INNER].map((d) => (
          <g key={d}>
            <path d={d} stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1" transform="translate(0 0.9)" />
            <path d={d} stroke="#2a2d32" strokeOpacity="0.42" strokeWidth="0.9" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Brushed part={part} />
      {part === "body" ? <Engraving /> : null}
      <span className="xiaomi-band absolute inset-0" />
    </span>
  )
}

const css = `
${S} {
  --ink: #141619;
  --qr-bg: #eef0f2;
}
${S} .pass-face {
  background-color: #b4b7bb;
  background-image:
    linear-gradient(98deg, #9da0a5 0%, #c3c6ca 18%, #aeb1b6 34%, #d2d5d8 52%, #a7aaaf 70%, #bfc2c6 86%, #a3a6ab 100%),
    linear-gradient(180deg, #c4c7cb 0%, #a9acb1 100%);
  background-blend-mode: soft-light, normal;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    inset 0 0 0 1px rgb(255 255 255 / 0.4),
    inset 0 -1px 0 rgb(40 44 50 / 0.35),
    inset 0 -18px 28px -24px rgb(30 34 40 / 0.5);
}
${S} .pass-brand {
  filter: invert(1);
}
${S} .pass-market-logo {
  box-shadow: 0 1px 2px rgb(30 34 40 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.4);
}
${S} .pass-perf {
  border-color: rgb(40 44 50 / 0.35);
}
${S} .pass-qr {
  border-radius: 0.3rem;
  box-shadow: inset 0 1px 1px rgb(30 34 40 / 0.25), 0 1px 0 rgb(255 255 255 / 0.7);
}
${S} .pass-sheen {
  background: radial-gradient(28rem circle at var(--mx) var(--my), rgb(255 255 255 / 0.35), rgb(255 255 255 / 0) 60%);
  mix-blend-mode: soft-light;
}
${S} .xiaomi-band {
  background:
    linear-gradient(100deg, rgb(255 255 255 / 0) 30%, rgb(255 255 255 / 0.22) 42%, rgb(255 255 255 / 0) 54%),
    linear-gradient(100deg, rgb(255 255 255 / 0) 64%, rgb(40 44 50 / 0.08) 74%, rgb(255 255 255 / 0) 84%);
  mix-blend-mode: soft-light;
}
${S} .xiaomi-squircle {
  top: 50%;
  right: -8rem;
  width: 19rem;
  height: 19rem;
  transform: translateY(-50%);
}
${S}[data-state="locked"] .pass-face {
  filter: grayscale(1) brightness(0.92) contrast(0.9);
}
${S}[data-state="locked"] .pass-face::after {
  background: rgb(200 202 206 / 0.4);
}
${S}[data-state="boosted"] .pass-face::after {
  mix-blend-mode: overlay;
  opacity: 0.6;
  background: linear-gradient(115deg, #0000 14%, #d9a441 28%, #b0559a 38%, #4b5fd1 48%, #2fa6c4 58%, #8fc45a 68%, #d9a441 76%, #0000 88%) 0 0 / 250% 100%;
}
`

export const xiaomiSkin: Skin = {
  id: "XIAOMI",
  name: "Xiaomi",
  logo: "/logos/io_XIAOMI.svg",
  css,
  Art,
}
