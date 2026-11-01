import type { CSSProperties } from "react"
import type { Skin, SkinPart } from "./types"

const S = `.pass-card[data-skin="IONQ"]`

const css = `
${S} {
  --ink: #eef4ff;
  --qr-bg: #e7efff;
}
${S} .pass-face {
  background-color: #061a48;
  background-image:
    linear-gradient(128deg, rgb(255 255 255 / 0) 12%, rgb(220 238 255 / 0.13) 13.5%, rgb(255 255 255 / 0) 18%),
    linear-gradient(104deg, rgb(255 255 255 / 0) 30%, rgb(140 200 255 / 0.1) 38%, rgb(255 255 255 / 0) 44%, rgb(255 255 255 / 0) 62%, rgb(120 170 255 / 0.07) 68%, rgb(255 255 255 / 0) 74%),
    radial-gradient(80% 60% at 12% 0%, rgb(80 150 255 / 0.34) 0%, rgb(80 150 255 / 0) 62%),
    radial-gradient(70% 90% at 100% 30%, rgb(40 90 220 / 0.22) 0%, rgb(40 90 220 / 0) 60%),
    radial-gradient(130% 110% at 90% 110%, rgb(0 4 20 / 0.7) 0%, rgb(0 4 20 / 0) 62%),
    linear-gradient(180deg, #0b2c74 0%, #061a4a 48%, #030c2a 100%);
  box-shadow:
    inset 0 1px 0 rgb(210 235 255 / 0.55),
    inset 0 0 0 1px rgb(150 200 255 / 0.2),
    inset 0 0 1.6rem rgb(70 150 255 / 0.18),
    inset 0 -2px 0 rgb(0 0 0 / 0.4);
}
${S} .pass-brand {
  filter: drop-shadow(0 0 6px rgb(120 180 255 / 0.35));
}
${S} .pass-market-logo {
  box-shadow: 0 0 0 1px rgb(170 210 255 / 0.35), 0 2px 6px rgb(0 0 20 / 0.6);
}
${S} .pass-perf {
  border-color: rgb(0 0 0 / 0);
}
${S} .pass-qr {
  filter: drop-shadow(0 0 1px rgb(200 225 255 / 0.6)) drop-shadow(0 4px 10px rgb(0 6 30 / 0.7));
}
${S} .pass-qr path {
  fill: #051436;
}
${S} .ionq-bevel {
  position: absolute;
  inset: 6px;
  border-radius: calc(var(--radius) - 6px);
  border: 1px solid rgb(160 205 255 / 0.18);
  box-shadow: inset 0 1px 0 rgb(200 230 255 / 0.12);
}
${S} .pass-stub .ionq-bevel {
  border-radius: 0.5rem;
}
${S} .pass-body .ionq-bevel {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
${S} .ionq-trap {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
}
${S} .pass-body .ionq-trap {
  bottom: 0;
}
${S} .pass-stub .ionq-trap {
  top: 0;
}
${S} .ionq-laser {
  position: absolute;
  left: 0;
  right: 0;
  top: -0.5px;
  height: 1px;
  background: linear-gradient(90deg, rgb(110 120 255 / 0) 0%, rgb(130 150 255 / 0.55) 12%, rgb(190 210 255 / 0.85) 50%, rgb(130 150 255 / 0.55) 88%, rgb(110 120 255 / 0) 100%);
  box-shadow: 0 0 4px 1px rgb(110 130 255 / 0.55), 0 0 14px 3px rgb(90 110 255 / 0.22);
}
${S} .ionq-beam {
  position: absolute;
  left: 50%;
  width: 1px;
  height: 5.5rem;
  transform: translateX(-50%);
  background: linear-gradient(0deg, rgb(160 180 255 / 0.5), rgb(160 180 255 / 0));
  box-shadow: 0 0 6px 1px rgb(110 130 255 / 0.25);
}
${S} .pass-body .ionq-beam {
  bottom: 0;
}
${S} .pass-stub .ionq-beam {
  display: none;
}
${S} .ionq-ion {
  position: absolute;
  left: var(--p);
  top: 0;
  width: 1.5rem;
  height: 1.5rem;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0 2px, #cfe6ff 2.6px, rgb(100 170 255 / 0.75) 4px, rgb(70 120 255 / 0.22) 7.5px, rgb(70 120 255 / 0) 70%);
  transition: opacity 0.4s ease-out;
}
${S}[data-state="locked"] .ionq-ion,
${S}[data-state="locked"] .ionq-laser,
${S}[data-state="locked"] .ionq-beam {
  opacity: 0.35;
}
${S}[data-state="boosted"] .ionq-ion {
  animation: ionq-pulse 2.4s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.22s);
}
@keyframes ionq-pulse {
  50% { transform: translate(-50%, -50%) scale(1.35); filter: brightness(1.4); }
}
@container pass-card (min-width: 34rem) {
  ${S} .ionq-trap {
    left: auto;
    right: auto;
    top: 0;
    bottom: 0;
    width: 0;
    height: auto;
  }
  ${S} .pass-body .ionq-trap {
    right: 0;
  }
  ${S} .pass-stub .ionq-trap {
    left: 0;
  }
  ${S} .ionq-laser {
    left: -0.5px;
    right: auto;
    top: 0;
    bottom: 0;
    width: 1px;
    height: auto;
    background: linear-gradient(180deg, rgb(110 120 255 / 0) 0%, rgb(130 150 255 / 0.55) 12%, rgb(190 210 255 / 0.85) 50%, rgb(130 150 255 / 0.55) 88%, rgb(110 120 255 / 0) 100%);
  }
  ${S} .ionq-beam {
    left: auto;
    top: 50%;
    width: 5.5rem;
    height: 1px;
    transform: translateY(-50%);
    background: linear-gradient(270deg, rgb(160 180 255 / 0.5), rgb(160 180 255 / 0));
  }
  ${S} .pass-body .ionq-beam {
    bottom: auto;
    right: 0;
  }
  ${S} .ionq-ion {
    left: 0;
    top: var(--p);
  }
}
@media (prefers-reduced-motion: reduce) {
  ${S}[data-state="boosted"] .ionq-ion { animation: none; }
}
`

const CHAIN = [0, 12.36, 22.72, 32.19, 41.19, 50, 58.81, 67.81, 77.28, 87.64, 100]
const SPAN = 0.6
const START = 50 - SPAN * 50

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden="true" data-part={part} className="pointer-events-none absolute inset-0">
      <span className="ionq-bevel" />
      <span className="ionq-trap">
        <span className="ionq-beam" />
        <span className="ionq-laser" />
        {CHAIN.map((value, index) => (
          <span
            key={index}
            className="ionq-ion"
            style={{ "--p": `${(START + value * SPAN).toFixed(2)}%`, "--i": index } as CSSProperties}
          />
        ))}
      </span>
    </span>
  )
}

export const ionqSkin: Skin = {
  id: "IONQ",
  name: "IonQ",
  logo: "/logos/io_IONQ.png",
  css,
  Art,
}
