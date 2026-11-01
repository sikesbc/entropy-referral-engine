import { useId } from "react"
import type { Skin, SkinPart } from "./types"

const S = `.pass-card[data-skin="DRAM"]`

const GOLD = "linear-gradient(180deg, #fff3c2 0%, #f0c95e 22%, #d29e33 62%, #a9771d 100%)"
const FINGER_MASK = "repeating-linear-gradient(90deg, #000 0 5px, #0000 5px 7.5px)"

const css = `
${S} {
  --ink: #f3f6ef;
  --qr-bg: #f6f6f0;
}
${S} .pass-face {
  background-color: #0a5a38;
  background-image:
    linear-gradient(160deg, rgb(255 255 255 / 0.12) 0%, rgb(255 255 255 / 0) 26%),
    linear-gradient(118deg, rgb(255 255 255 / 0) 40%, rgb(210 255 230 / 0.07) 48%, rgb(255 255 255 / 0) 56%),
    radial-gradient(120% 100% at 100% 100%, rgb(0 25 14 / 0.5) 0%, rgb(0 25 14 / 0) 60%),
    linear-gradient(180deg, #0e6c44 0%, #0a5636 55%, #073f28 100%);
  box-shadow:
    inset 0 1px 0 rgb(200 255 220 / 0.28),
    inset 0 0 0 1px rgb(160 230 190 / 0.12),
    inset 0 0 0 3px rgb(0 30 16 / 0.25);
}
${S} .pass-market-logo {
  box-shadow: 0 1px 2px rgb(0 20 10 / 0.6);
}
${S} .pass-perf {
  border-color: rgb(2 22 13 / 0.9);
}
${S} .pass-qr {
  filter: drop-shadow(0 2px 2px rgb(0 20 10 / 0.6));
}
${S} .pass-qr path {
  fill: #0e120f;
}
${S} .dram-traces {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
${S} .dram-chips {
  position: absolute;
  top: 50%;
  left: 1.25rem;
  right: 1.25rem;
  height: 4.6rem;
  transform: translateY(-58%);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3.5rem, 1fr));
  grid-template-rows: 100%;
  grid-auto-rows: 0;
  column-gap: 1.1rem;
  overflow: hidden;
  padding: 0 0.25rem;
}
${S} .dram-chip {
  position: relative;
  margin: 4px 0;
  border-radius: 2px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.1) 0%, rgb(255 255 255 / 0) 14%),
    radial-gradient(120% 80% at 30% 10%, #2a2d31 0%, #141518 55%, #0b0c0d 100%);
  box-shadow:
    0 0 0 3px rgb(0 0 0 / 0),
    0 2px 3px rgb(0 18 9 / 0.65),
    inset 0 1px 0 rgb(255 255 255 / 0.12),
    inset 0 0 0 1px rgb(255 255 255 / 0.04);
  outline: 1px solid rgb(235 245 238 / 0.32);
  outline-offset: 3px;
}
${S} .dram-chip::before {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #0a0b0c;
  box-shadow: inset 0 1px 0 rgb(0 0 0 / 0.8), 0 1px 0 rgb(255 255 255 / 0.1);
}
${S} .dram-mark {
  position: absolute;
  inset: auto 5px 6px;
  font: 500 5.5px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.04em;
  color: rgb(200 205 210 / 0.38);
  white-space: nowrap;
  overflow: hidden;
  text-shadow: none;
}
${S} .dram-caps {
  position: absolute;
  top: calc(50% + 1.85rem);
  left: 1.6rem;
  right: 1.6rem;
  height: 4px;
  background: repeating-linear-gradient(90deg, #d7d4cb 0 2px, #9a7a48 2px 7px, #d7d4cb 7px 9px, rgb(0 0 0 / 0) 9px 26px);
  opacity: 0.7;
  filter: drop-shadow(0 1px 0 rgb(0 20 10 / 0.6));
}
${S} .dram-fingers {
  position: absolute;
  bottom: 0;
  left: 1.5rem;
  right: 1.5rem;
  height: 1.05rem;
  display: flex;
  gap: 0.6rem;
}
${S} .dram-fingers > span {
  flex: 1 1 0;
  background: ${GOLD};
  -webkit-mask: ${FINGER_MASK};
  mask: ${FINGER_MASK};
  filter: drop-shadow(0 -1px 0 rgb(0 20 10 / 0.4));
}
${S} .dram-fingers > span:first-child {
  flex-grow: 0.72;
}
${S} .pass-body .dram-fingers {
  display: none;
}
${S} .dram-edge {
  position: absolute;
  bottom: 1.05rem;
  left: 1.2rem;
  right: 1.2rem;
  height: 1px;
  background: rgb(235 245 238 / 0.18);
}
${S} .pass-body .dram-edge {
  display: none;
}
@container pass-card (min-width: 34rem) {
  ${S} .pass-body .dram-fingers,
  ${S} .pass-body .dram-edge {
    display: flex;
  }
  ${S} .pass-stub .dram-fingers > span:first-child {
    display: none;
  }
}
`

const CHIPS = ["U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8"]

function bundle(
  x0: number,
  y0: number,
  y1: number,
  dx: number,
  y2: number,
  count: number,
  gap: number,
): string[] {
  return Array.from({ length: count }, (_, index) => {
    const x = x0 + index * gap
    const bend = y1 + index * gap * 0.41
    return `M${x} ${y0}V${bend}l${dx} ${Math.abs(dx)}V${y2}`
  })
}

function Traces({ part }: { part: SkinPart }) {
  const id = useId().replace(/:/g, "")
  const paths =
    part === "body"
      ? [
          ...bundle(40, 0, 40, 24, 320, 5, 7),
          ...bundle(180, 0, 60, -30, 320, 6, 7),
          ...bundle(300, 0, 30, 18, 320, 4, 7),
          ...bundle(520, 0, 50, -40, 320, 6, 7),
          ...bundle(640, 0, 70, 22, 320, 5, 7),
        ]
      : [
          ...bundle(30, 0, 20, 16, 200, 7, 7),
          ...bundle(170, 0, 30, -18, 200, 6, 7),
          ...bundle(300, 0, 12, 24, 200, 8, 7),
        ]
  const vias =
    part === "body"
      ? [
          [26, 22],
          [150, 34],
          [262, 18],
          [420, 28],
          [600, 42],
          [84, 290],
          [380, 296],
          [700, 284],
        ]
      : [
          [18, 14],
          [150, 18],
          [280, 10],
          [380, 22],
        ]
  return (
    <svg
      viewBox={part === "body" ? "0 0 720 320" : "0 0 420 200"}
      preserveAspectRatio="xMinYMid slice"
      className="dram-traces"
    >
      <defs>
        <filter id={`dram-blur-${id}`}>
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
      </defs>
      <g
        fill="none"
        stroke="#3fb37a"
        strokeOpacity="0.22"
        strokeWidth="1.6"
        strokeLinejoin="round"
        filter={`url(#dram-blur-${id})`}
      >
        {paths.map((path, index) => (
          <path key={index} d={path} />
        ))}
      </g>
      {vias.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.6"
          fill="#05301f"
          stroke="#57c48e"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
      ))}
    </svg>
  )
}

function Fingers() {
  return (
    <>
      <span className="dram-edge" />
      <span className="dram-fingers">
        <span />
        <span />
      </span>
    </>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Traces part={part} />
      {part === "body" ? (
        <>
          <span className="dram-chips">
            {CHIPS.map((ref) => (
              <span key={ref} className="dram-chip">
                <span className="dram-mark">
                  D5 16Gb
                  <br />
                  {`H5CG4${ref.slice(1)}8MEB`}
                </span>
              </span>
            ))}
          </span>
          <span className="dram-caps" />
        </>
      ) : null}
      <Fingers />
    </span>
  )
}

export const dramSkin: Skin = {
  id: "DRAM",
  name: "DRAM",
  logo: "/logos/io_DRAM.png",
  css,
  Art,
}
