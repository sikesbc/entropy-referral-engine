import { useId } from "react"
import type { Skin, SkinPart } from "./types"

const S = `.pass-card[data-skin="SNDK"]`

const css = `
${S} {
  --ink: #fff6f2;
  --qr-bg: #fffaf7;
}
${S} .pass-face {
  background-color: #b80c08;
  background-image:
    linear-gradient(174deg, rgb(255 255 255 / 0.2) 0%, rgb(255 255 255 / 0.05) 9%, rgb(255 255 255 / 0) 22%),
    linear-gradient(122deg, rgb(255 255 255 / 0) 16%, rgb(255 240 235 / 0.16) 17.5%, rgb(255 255 255 / 0) 21%),
    linear-gradient(116deg, rgb(255 255 255 / 0) 36%, rgb(255 222 214 / 0.13) 44%, rgb(255 255 255 / 0.02) 50%, rgb(255 255 255 / 0) 58%),
    radial-gradient(130% 90% at 100% 100%, rgb(60 0 0 / 0.55) 0%, rgb(60 0 0 / 0) 62%),
    radial-gradient(90% 70% at 0% 0%, rgb(255 90 70 / 0.35) 0%, rgb(255 90 70 / 0) 60%),
    linear-gradient(180deg, #d3150c 0%, #b60c07 48%, #8a0604 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 225 215 / 0.55),
    inset 0 0 0 1px rgb(255 160 140 / 0.18),
    inset 0 -2px 0 rgb(70 0 0 / 0.35);
  text-shadow: 0 1px 0 rgb(80 0 0 / 0.35);
}
${S} .pass-brand {
  filter: drop-shadow(0 1px 0 rgb(80 0 0 / 0.5));
}
${S} .pass-market-logo {
  box-shadow: 0 0 0 1px rgb(255 235 228 / 0.7), 0 1px 2px rgb(60 0 0 / 0.6);
}
${S} .pass-perf {
  border-color: rgb(255 225 215 / 0.42);
}
${S} .pass-qr {
  filter: drop-shadow(0 1px 0 rgb(255 200 190 / 0.25)) drop-shadow(0 2px 3px rgb(50 0 0 / 0.55));
}
${S} .pass-qr path {
  fill: #2a0504;
}
${S} .sndk-pocket {
  position: absolute;
  inset: 0.7rem;
  border-radius: 0.75rem;
  box-shadow:
    inset 0 2px 3px rgb(55 0 0 / 0.38),
    inset 0 -1px 0 rgb(255 205 195 / 0.22),
    0 1px 0 rgb(255 215 205 / 0.16),
    0 -1px 0 rgb(60 0 0 / 0.22);
}
${S} .sndk-die {
  position: absolute;
  top: 50%;
  right: -2.5rem;
  width: min(72%, 18rem);
  transform: translateY(-46%) rotate(-4deg);
  opacity: 0.55;
  mix-blend-mode: multiply;
}
${S} .sndk-ridges {
  position: absolute;
  top: 50%;
  right: 0.3rem;
  width: 0.5rem;
  height: 4.5rem;
  transform: translateY(-50%);
  background: repeating-linear-gradient(180deg, rgb(255 220 210 / 0.38) 0 1px, rgb(70 0 0 / 0.5) 1px 3px, rgb(0 0 0 / 0) 3px 7px);
  border-radius: 1px;
}
${S} .sndk-switch {
  position: absolute;
  top: 50%;
  right: 0.3rem;
  width: 0.5rem;
  height: 2.75rem;
  transform: translateY(-50%);
  border-radius: 2px;
  background: linear-gradient(90deg, #4a0302, #6a0503 60%, #3a0201);
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.6), 0 1px 0 rgb(255 210 200 / 0.25);
}
${S} .sndk-knob {
  position: absolute;
  left: 1px;
  right: 1px;
  top: 2px;
  height: 0.95rem;
  border-radius: 1px;
  background: linear-gradient(90deg, #f6f1ec, #d8d0c8);
  box-shadow: 0 1px 1px rgb(0 0 0 / 0.5), inset 0 1px 0 #fff;
  transition: top 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
${S}[data-state="locked"] .sndk-knob {
  top: calc(100% - 0.95rem - 2px);
}
${S} .sndk-arrow {
  position: absolute;
  top: calc(50% + 1.75rem);
  right: 0.3rem;
  width: 0.5rem;
  height: 0.4rem;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  background: rgb(60 0 0 / 0.55);
  filter: drop-shadow(0 1px 0 rgb(255 210 200 / 0.3));
}
`

const PADS = Array.from({ length: 22 }, (_, index) => 18 + index * 11)

function NandDie() {
  const id = useId().replace(/:/g, "")
  const wordlines = `sndk-wl-${id}`
  const planes = [
    [14, 12],
    [146, 12],
    [14, 98],
    [146, 98],
  ]
  return (
    <svg viewBox="0 0 280 200" className="sndk-die" aria-hidden="true">
      <defs>
        <pattern id={wordlines} width="4" height="2.4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="#4a0000" opacity="0.55" />
        </pattern>
      </defs>
      <rect
        x="0.5"
        y="0.5"
        width="279"
        height="199"
        rx="3"
        fill="#6a0000"
        fillOpacity="0.12"
        stroke="#3c0000"
        strokeOpacity="0.6"
      />
      <rect
        x="5"
        y="5"
        width="270"
        height="190"
        rx="2"
        fill="none"
        stroke="#3c0000"
        strokeOpacity="0.35"
        strokeDasharray="2 2"
      />
      {planes.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect
            x={x}
            y={y}
            width="120"
            height="76"
            fill={`url(#${wordlines})`}
            stroke="#3c0000"
            strokeOpacity="0.55"
          />
          <rect x={x + 56} y={y} width="8" height="76" fill="#3c0000" fillOpacity="0.4" />
          <rect x={x} y={y + 68} width="120" height="8" fill="#3c0000" fillOpacity="0.32" />
        </g>
      ))}
      {PADS.map((x) => (
        <g key={x}>
          <rect x={x} y="181" width="6" height="7" fill="#3c0000" fillOpacity="0.5" />
          <path
            d={`M${x + 3} 188 q 2 9 ${(x - 140) * 0.08} 16`}
            stroke="#3c0000"
            strokeOpacity="0.45"
            strokeWidth="0.6"
            fill="none"
          />
        </g>
      ))}
    </svg>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="sndk-pocket" />
      {part === "body" ? (
        <>
          <NandDie />
          <span className="sndk-ridges" />
        </>
      ) : (
        <>
          <span className="sndk-switch">
            <span className="sndk-knob" />
          </span>
          <span className="sndk-arrow" />
        </>
      )}
    </span>
  )
}

export const sndkSkin: Skin = {
  id: "SNDK",
  name: "Sandisk",
  logo: "/logos/io_SNDK.svg",
  css,
  Art,
}
