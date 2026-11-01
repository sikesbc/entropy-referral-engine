import type { Skin, SkinPart } from "./types"

const S = '.pass-card[data-skin="TCNT"]'

const CENTER = 120
const GRAINS: { x: number; y: number }[] = (() => {
  const out: { x: number; y: number }[] = []
  const gap = 10.5
  const rowHeight = gap * 0.866
  for (let row = -12; row <= 12; row++) {
    for (let column = -12; column <= 12; column++) {
      const x = column * gap + (row % 2 === 0 ? 0 : gap / 2)
      const y = row * rowHeight
      const radius = Math.hypot(x, y)
      if (radius > 50 && radius < 94) out.push({ x: CENTER + x, y: CENTER + y })
    }
  }
  return out
})()

const GRAIN_LIGHT = GRAINS.map(
  ({ x, y }) =>
    `M${(x - 3).toFixed(1)} ${(y + 0.6).toFixed(1)}A3 3 0 0 1 ${(x + 1.2).toFixed(1)} ${(y - 2.8).toFixed(1)}`,
).join("")
const GRAIN_DARK = GRAINS.map(
  ({ x, y }) =>
    `M${(x + 3).toFixed(1)} ${(y - 0.6).toFixed(1)}A3 3 0 0 1 ${(x - 1.2).toFixed(1)} ${(y + 2.8).toFixed(1)}a1.6 1.6 0 0 1 -0.4 -2.6`,
).join("")

const RINGS = [117, 103, 46, 34]

function Jade({ part }: { part: SkinPart }) {
  return (
    <svg className="absolute inset-0 h-full w-full">
      <defs>
        <filter id={`tcnt-cloud-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0045 0.007"
            numOctaves="4"
            seed={part === "body" ? 7 : 19}
          />
          <feColorMatrix values="0 0 0 0 0.72  0 0 0 0 0.95  0 0 0 0 0.83  2.4 0 0 0 -1.05" />
        </filter>
        <filter id={`tcnt-vein-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.012 0.02"
            numOctaves="3"
            seed={part === "body" ? 31 : 44}
          />
          <feColorMatrix values="0 0 0 0 0.01  0 0 0 0 0.12  0 0 0 0 0.08  -4 0 0 0 0.9" />
        </filter>
        <filter id={`tcnt-flake-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="3" />
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 1  0 0 0 0 0.92  6 0 0 0 -4.1" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#tcnt-vein-${part})`} opacity="0.35" />
      <rect
        width="100%"
        height="100%"
        filter={`url(#tcnt-cloud-${part})`}
        opacity="0.4"
        style={{ mixBlendMode: "screen" }}
      />
      <rect width="100%" height="100%" filter={`url(#tcnt-flake-${part})`} opacity="0.18" />
    </svg>
  )
}

function Bi() {
  return (
    <svg viewBox="0 0 240 240" className="tcnt-bi absolute">
      <g fill="none">
        {RINGS.map((radius) => (
          <g key={radius}>
            <circle
              cx={CENTER + 0.7}
              cy={CENTER + 1}
              r={radius}
              stroke="#011a12"
              strokeOpacity="0.55"
              strokeWidth="1.4"
            />
            <circle
              cx={CENTER - 0.5}
              cy={CENTER - 0.7}
              r={radius}
              stroke="#c8f7e0"
              strokeOpacity="0.28"
              strokeWidth="0.9"
            />
          </g>
        ))}
        <path d={GRAIN_DARK} stroke="#011a12" strokeOpacity="0.28" strokeWidth="0.9" strokeLinecap="round" />
        <path d={GRAIN_LIGHT} stroke="#d4fbe8" strokeOpacity="0.18" strokeWidth="0.7" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Jade part={part} />
      {part === "body" ? <Bi /> : null}
      <span className={`tcnt-gloss tcnt-gloss-${part} absolute inset-0`} />
    </span>
  )
}

const css = `
${S} {
  --ink: #effbf4;
  --qr-bg: #03231a;
}
${S} .pass-face {
  background-color: #0a4434;
  background-image:
    radial-gradient(90% 70% at 22% 18%, rgb(84 190 146 / 0.55) 0%, rgb(84 190 146 / 0) 70%),
    radial-gradient(80% 90% at 85% 95%, rgb(1 24 16 / 0.75) 0%, rgb(1 24 16 / 0) 70%),
    linear-gradient(160deg, #1d7a5a 0%, #0d5640 38%, #07392b 72%, #042419 100%);
  box-shadow:
    inset 0 1px 0 rgb(220 255 238 / 0.45),
    inset 0 0 0 1px rgb(170 240 205 / 0.12),
    inset 0 0 26px rgb(0 20 12 / 0.55),
    inset 0 -22px 40px -26px rgb(0 0 0 / 0.8);
}
${S} .pass-perf {
  border-color: rgb(200 250 225 / 0.22);
}
${S} .pass-market-logo {
  box-shadow: 0 0 0 1px rgb(200 250 225 / 0.18), 0 2px 6px rgb(0 20 12 / 0.5);
}
${S} .pass-qr {
  border-radius: 0.3rem;
  box-shadow: inset 0 0 0 1px rgb(200 250 225 / 0.1), 0 1px 0 rgb(220 255 238 / 0.15);
}
${S} .tcnt-bi {
  top: 50%;
  right: -7.5rem;
  width: 17rem;
  height: 17rem;
  transform: translateY(-46%);
}
${S} .tcnt-gloss {
  background:
    radial-gradient(60% 34% at 30% 6%, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0) 100%),
    linear-gradient(168deg, rgb(235 255 245 / 0.13) 0%, rgb(235 255 245 / 0.05) 26%, rgb(235 255 245 / 0) 26.4%),
    linear-gradient(100deg, rgb(255 255 255 / 0) 62%, rgb(220 255 238 / 0.07) 70%, rgb(255 255 255 / 0) 78%);
}
${S} .tcnt-gloss-stub {
  background:
    radial-gradient(70% 50% at 25% 0%, rgb(255 255 255 / 0.12) 0%, rgb(255 255 255 / 0) 100%),
    linear-gradient(100deg, rgb(255 255 255 / 0) 55%, rgb(220 255 238 / 0.06) 65%, rgb(255 255 255 / 0) 75%);
}
${S}[data-state="boosted"] .pass-face::after {
  background: linear-gradient(115deg, #0000 20%, #f5e6a8 36%, #c9ffe4 48%, #a8e6ff 58%, #f5e6a8 68%, #0000 82%) 0 0 / 250% 100%;
  opacity: 0.3;
}
`

export const tcntSkin: Skin = {
  id: "TCNT",
  name: "Tencent",
  logo: "/logos/io_TCNT.png",
  css,
  Art,
}
