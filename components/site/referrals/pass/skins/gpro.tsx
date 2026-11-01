import type { Skin, SkinPart } from "./types"

const S = '.pass-card[data-skin="GPRO"]'

function Rubber({ part }: { part: SkinPart }) {
  return (
    <svg className="absolute inset-0 h-full w-full">
      <defs>
        <pattern
          id={`gpro-knurl-${part}`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path d="M0 0L3.5 3.5L0 7Z" fill="#2d3035" />
          <path d="M0 0L7 0L3.5 3.5Z" fill="#202226" />
          <path d="M0 7L7 7L3.5 3.5Z" fill="#17181b" />
          <path d="M7 0L7 7L3.5 3.5Z" fill="#0a0b0c" />
        </pattern>
        <filter id={`gpro-matte-${part}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="6" />
          <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.62  0 0 0 0 0.66  2.2 0 0 0 -1.15" />
        </filter>
        <radialGradient id={`gpro-light-${part}`} cx="18%" cy="0%" r="110%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.09" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#gpro-knurl-${part})`} />
      <rect width="100%" height="100%" fill={`url(#gpro-light-${part})`} />
      <rect width="100%" height="100%" filter={`url(#gpro-matte-${part})`} opacity="0.22" />
    </svg>
  )
}

function Lens() {
  return (
    <span className="gpro-lens absolute">
      <span className="gpro-lens-knurl absolute inset-0 rounded-full" />
      <span className="gpro-lens-ring absolute rounded-full" />
      <span className="gpro-lens-accent absolute rounded-full" />
      <span className="gpro-lens-glass absolute rounded-full" />
      <span className="gpro-lens-element absolute rounded-full" />
      <span className="gpro-lens-glint absolute rounded-full" />
    </span>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Rubber part={part} />
      <span className={`gpro-plate gpro-plate-${part} absolute`} />
      {part === "body" ? (
        <>
          <Lens />
          <span className="gpro-led absolute rounded-full" />
        </>
      ) : null}
    </span>
  )
}

const css = `
${S} {
  --ink: #f3f4f6;
  --qr-bg: #0b0c0d;
}
${S} .pass-face {
  background-color: #141517;
  background-image: linear-gradient(180deg, #1a1b1e 0%, #0f1012 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.1),
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    inset 0 -18px 30px -24px rgb(0 0 0 / 0.9);
}
${S} .pass-perf {
  border-color: rgb(255 255 255 / 0.16);
}
${S} .pass-market-logo {
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.12);
}
${S} .gpro-plate {
  inset: 0;
  background:
    radial-gradient(130% 100% at 0% 0%, rgb(26 27 30 / 0.82) 0%, rgb(22 23 26 / 0.72) 50%, rgb(22 23 26 / 0) 82%);
}
${S} .gpro-plate-stub {
  background: radial-gradient(90% 140% at 0% 50%, rgb(22 23 26 / 0.8) 0%, rgb(22 23 26 / 0.65) 50%, rgb(22 23 26 / 0) 90%);
}
${S} .gpro-lens {
  top: 1.15rem;
  right: 1.15rem;
  width: 6.4rem;
  height: 6.4rem;
  border-radius: 9999px;
  box-shadow:
    0 0 0 3px #0a0b0c,
    0 0 0 4px rgb(255 255 255 / 0.06),
    0 6px 14px rgb(0 0 0 / 0.7);
}
${S} .gpro-lens-knurl {
  background:
    repeating-conic-gradient(#3b3e43 0 2.5deg, #121315 2.5deg 5deg);
  -webkit-mask: radial-gradient(circle, #0000 calc(50% - 5px), #000 calc(50% - 4.5px));
  mask: radial-gradient(circle, #0000 calc(50% - 5px), #000 calc(50% - 4.5px));
}
${S} .gpro-lens-ring {
  inset: 5px;
  background:
    repeating-radial-gradient(circle, rgb(255 255 255 / 0.05) 0 1px, rgb(0 0 0 / 0.06) 1px 2px),
    conic-gradient(from 210deg, #4a4e54, #b9bdc2 7%, #63676d 16%, #2b2d31 28%, #7d8187 40%, #d4d7db 49%, #80848a 57%, #34373b 70%, #9a9ea4 84%, #4a4e54);
  box-shadow: inset 0 1px 1px rgb(255 255 255 / 0.35), inset 0 -1px 2px rgb(0 0 0 / 0.5);
}
${S} .gpro-lens-accent {
  inset: 22%;
  background: #00a3e0;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.6), 0 0 6px rgb(0 163 224 / 0.45);
}
${S} .gpro-lens-glass {
  inset: calc(22% + 2px);
  background:
    radial-gradient(circle at 68% 72%, rgb(150 70 220 / 0.38), rgb(150 70 220 / 0) 32%),
    radial-gradient(circle at 30% 64%, rgb(40 200 170 / 0.22), rgb(40 200 170 / 0) 28%),
    radial-gradient(circle at 50% 50%, #18202c 0%, #0a0e14 55%, #030405 100%);
  box-shadow:
    inset 0 0 0 3px #08090b,
    inset 0 0 0 4px rgb(255 255 255 / 0.07),
    inset 0 4px 10px rgb(0 0 0 / 0.9);
}
${S} .gpro-lens-element {
  inset: 39%;
  background: radial-gradient(circle at 40% 38%, #2a3a55 0%, #0b1220 60%, #04060a 100%);
  box-shadow: 0 0 0 1px rgb(120 160 255 / 0.18), 0 0 0 4px rgb(0 0 0 / 0.55);
}
${S} .gpro-lens-glint {
  top: 30%;
  left: 31%;
  width: 16%;
  height: 9%;
  background: radial-gradient(closest-side, rgb(255 255 255 / 0.75), rgb(255 255 255 / 0));
  transform: rotate(-35deg);
}
${S} .gpro-led {
  top: 1.75rem;
  right: 8.35rem;
  width: 0.4rem;
  height: 0.4rem;
  background: radial-gradient(circle at 40% 35%, #8fe3ff 0%, #00a3e0 45%, #005e85 100%);
  box-shadow: 0 0 0 1.5px #08090a, 0 0 8px rgb(0 163 224 / 0.8);
}
${S}[data-state="locked"] .gpro-led {
  box-shadow: 0 0 0 1.5px #08090a;
}
`

export const gproSkin: Skin = {
  id: "GPRO",
  name: "GoPro",
  logo: "/logos/io_GPRO.png",
  css,
  Art,
}
