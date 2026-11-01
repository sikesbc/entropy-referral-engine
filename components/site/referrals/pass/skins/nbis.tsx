import type { Skin, SkinPart } from "./types"

const S = `.pass-card[data-skin="NBIS"]`

const HOLE =
  "radial-gradient(circle at 50% 62%, #262a30 0, #07080a 2.6px, rgb(0 0 0 / 0.85) 3.1px, rgb(200 210 220 / 0.16) 3.4px, rgb(0 0 0 / 0) 4px)"

const css = `
${S} {
  --ink: #eef1f4;
  --qr-bg: #eceef0;
}
${S} .pass-face {
  background-color: #2a2e34;
  background-image:
    linear-gradient(165deg, rgb(255 255 255 / 0.1) 0%, rgb(255 255 255 / 0) 30%),
    radial-gradient(120% 100% at 100% 100%, rgb(0 0 0 / 0.45) 0%, rgb(0 0 0 / 0) 60%),
    repeating-radial-gradient(circle at 30% 20%, rgb(255 255 255 / 0.018) 0 1px, rgb(0 0 0 / 0.02) 1px 2px),
    linear-gradient(180deg, #33373e 0%, #24272c 55%, #1c1f23 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.2),
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    inset 0 -1px 0 rgb(0 0 0 / 0.5);
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.85), 0 0 6px rgb(0 0 0 / 0.5);
}
${S} .pass-brand {
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.8));
}
${S} .pass-market-logo {
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.5), 0 1px 3px rgb(0 0 0 / 0.6);
}
${S} .pass-perf {
  border-color: rgb(0 0 0 / 0.75);
}
${S} .pass-qr {
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.7));
}
${S} .pass-qr path {
  fill: #0b0e12;
}
${S} .nbis-mesh {
  position: absolute;
  inset: 1.1rem 0.9rem 0.9rem 1.7rem;
  border-radius: 0.4rem;
  background:
    ${HOLE} 0 0 / 12px 20.78px,
    ${HOLE} 6px 10.39px / 12px 20.78px;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.55), 0 1px 0 rgb(255 255 255 / 0.08);
  -webkit-mask: radial-gradient(140% 120% at 70% 50%, #000 40%, rgb(0 0 0 / 0.7) 100%);
  mask: radial-gradient(140% 120% at 70% 50%, #000 40%, rgb(0 0 0 / 0.7) 100%);
}
${S} .pass-stub .nbis-mesh {
  inset: 0.85rem;
}
${S} .nbis-rail {
  position: absolute;
  top: 0.85rem;
  bottom: 0.85rem;
  left: 0.55rem;
  width: 0.55rem;
  background:
    linear-gradient(180deg, #07080a 0 6px, rgb(0 0 0 / 0) 6px) 0 2px / 100% 15.9px repeat-y;
  -webkit-mask: linear-gradient(90deg, #000 0 100%) center / 6px 100% no-repeat;
  mask: linear-gradient(90deg, #000 0 100%) center / 6px 100% no-repeat;
  filter: drop-shadow(0 1px 0 rgb(255 255 255 / 0.12));
}
${S} .nbis-leds {
  position: absolute;
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 3px 6px;
  border-radius: 3px;
  background: linear-gradient(180deg, #0b0c0e, #16181b);
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.8), 0 1px 0 rgb(255 255 255 / 0.1);
}
${S} .pass-body .nbis-leds {
  top: 0.3rem;
  right: 1.6rem;
}
${S} .pass-stub .nbis-leds {
  bottom: 0.2rem;
  right: 1.6rem;
}
${S} .nbis-led {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--led);
  box-shadow: 0 0 3px var(--led), 0 0 7px var(--led);
}
${S} .nbis-led[data-blink] {
  animation: nbis-blink 1.3s steps(2, jump-none) infinite;
}
${S} .nbis-led[data-blink="fast"] {
  animation-duration: 0.45s;
}
${S}[data-state="locked"] .nbis-led {
  --led: #ff9f1a !important;
  animation: none;
}
${S}[data-state="boosted"] .nbis-led {
  --led: #d9ff4a !important;
}
@container pass-card (min-width: 34rem) {
  ${S} .pass-stub .nbis-leds {
    top: 0.3rem;
    bottom: auto;
  }
}
@keyframes nbis-blink {
  0% { opacity: 1; }
  100% { opacity: 0.18; }
}
@media (prefers-reduced-motion: reduce) {
  ${S} .nbis-led[data-blink] { animation: none; }
}
`

const GREEN = "#45f07a"
const AMBER = "#ffb02e"

function Leds({ colors }: { colors: { led: string; blink?: "slow" | "fast" }[] }) {
  return (
    <span className="nbis-leds">
      {colors.map(({ led, blink }, index) => (
        <span key={index} className="nbis-led" data-blink={blink} style={{ ["--led" as string]: led }} />
      ))}
    </span>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="nbis-mesh" />
      {part === "body" ? (
        <>
          <span className="nbis-rail" />
          <Leds colors={[{ led: GREEN }, { led: GREEN, blink: "fast" }, { led: AMBER, blink: "slow" }]} />
        </>
      ) : (
        <Leds colors={[{ led: GREEN, blink: "fast" }, { led: GREEN }]} />
      )}
    </span>
  )
}

export const nbisSkin: Skin = {
  id: "NBIS",
  name: "Nebius",
  logo: "/logos/io_NBIS.svg",
  css,
  Art,
}
