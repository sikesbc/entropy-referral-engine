type Corner = "tl" | "tr" | "bl" | "br"

const CORNER_AT: Record<Corner, string> = { tl: "0 0", tr: "100% 0", bl: "0 100%", br: "100% 100%" }
const CORNER_PLACE: Record<Corner, string> = {
  tl: "top left",
  tr: "top right",
  bl: "bottom left",
  br: "bottom right",
}
const CORNERS: Corner[] = ["tl", "tr", "bl", "br"]

function notches(...cut: Corner[]): string {
  const layers = CORNERS.map((corner) =>
    cut.includes(corner)
      ? `radial-gradient(circle at ${CORNER_AT[corner]}, #0000 var(--notch), #000 calc(var(--notch) + 0.5px)) ${CORNER_PLACE[corner]} / 51% 51% no-repeat`
      : `linear-gradient(#000 0 0) ${CORNER_PLACE[corner]} / 51% 51% no-repeat`,
  ).join(", ")
  return `-webkit-mask: ${layers};\n  mask: ${layers};`
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"
const RING = "#f4f4f5"
const FOCUS = "#8b8b93"

export const MARKET_PASSES_CSS = `
.market-mini {
  --lift: 0px;
  --rx: 0deg;
  --ry: 0deg;
  --glow: 0;
  position: relative;
  display: block;
  flex-shrink: 0;
  width: var(--mini-w, 9rem);
  aspect-ratio: 34 / 20;
  padding: 0;
  border: 0;
  border-radius: 4.7% / 8%;
  container-type: inline-size;
  background: none;
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 3px;
  transform: perspective(40rem) translateY(var(--lift)) rotateX(var(--rx)) rotateY(var(--ry));
  filter: drop-shadow(0 0.35rem 0.45rem rgb(0 0 0 / 0.45));
  transition: transform 0.6s ${EASE}, filter 0.35s ${EASE}, outline-color 0.2s ease-out;
  -webkit-tap-highlight-color: transparent;
}
.market-mini[data-active="true"] {
  transition: transform 0.18s ${EASE}, filter 0.35s ${EASE}, outline-color 0.2s ease-out;
}
.market-grid .market-mini {
  --mini-w: 100%;
}
@media (hover: hover) {
  .market-mini:hover {
    --lift: -0.15rem;
    filter: drop-shadow(0 0.7rem 0.7rem rgb(0 0 0 / 0.55));
  }
}
.market-mini:focus-visible {
  outline-color: ${FOCUS};
}
.market-mini[aria-pressed="true"] {
  outline-color: ${RING};
}
.market-pass.pass-card {
  --notch: 1.6rem;
  --radius: 1.6rem;
  position: absolute;
  --glow: inherit;
  inset: 0;
  display: block;
  filter: none;
  transform: none;
  transition: none;
}
.market-scale {
  position: absolute;
  left: 0;
  top: 0;
  width: 34rem;
  height: 20rem;
  transform: scale(tan(atan2(100cqi, 34rem)));
  transform-origin: 0 0;
  container: pass-card / inline-size;
  pointer-events: none;
}
.market-scale .pass-ticket {
  height: 100%;
  cursor: inherit;
}
.market-scale .pass-body {
  flex: 1 1 auto;
  border-radius: var(--radius) 0 0 var(--radius);
  ${notches("tr", "br")}
}
.market-scale .pass-stub {
  padding: 0;
  border-radius: 0 var(--radius) var(--radius) 0;
  ${notches("tl", "bl")}
}
.market-scale .pass-perf {
  top: calc(var(--notch) + 0.8rem);
  bottom: calc(var(--notch) + 0.8rem);
  border-left-width: 5px;
}
.market-label {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 22fr 12fr;
  color: var(--ink);
  pointer-events: none;
  text-align: left;
}
.market-body-l {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 2cqi;
  padding: 5.5cqi 3cqi 5cqi 6cqi;
}
.market-stub-l {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 5.5cqi 3cqi 4.5cqi 5cqi;
}
.market-head {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 2.4cqi;
}
.market-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: max(0.5rem, 6.4cqi);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.005em;
}
.market-logo {
  height: 8cqi;
  width: auto;
  flex-shrink: 0;
  border-radius: 1.4cqi;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.18), 0 1px 2px rgb(0 0 0 / 0.4);
}
.market-pass.pass-card[data-skin="main"] {
  --mark-l: 0.5rem;
}
.market-pass[data-skin="main"] .market-logo {
  height: 6.4cqi;
  border-radius: 0;
  box-shadow: none;
}
.market-foot {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 2cqi;
}
.market-tag {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: max(0.5rem, 5.2cqi);
  font-weight: 500;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.market-pass[data-state="boosted"] .market-tag,
.market-pass[data-state="unlocked"]:not([data-skin="main"]) .market-tag {
  padding: 0.8cqi 2.6cqi;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 16%, transparent);
}
.market-lock {
  width: 6cqi;
  height: 6cqi;
  opacity: 0.8;
}
.market-rate {
  font-size: 17cqi;
  font-weight: 700;
  line-height: 0.8;
  margin-top: auto;
}
.market-bar {
  display: block;
  height: max(2px, 1.2cqi);
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 22%, transparent);
  overflow: hidden;
}
.market-bar > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: currentColor;
}
.market-mini .market-pass.pass-card[data-state="locked"] .pass-face {
  filter: saturate(0.35) brightness(0.8);
  transition: filter 0.3s ease-out;
}
.market-mini .market-pass.pass-card[data-state="locked"] .pass-face::after {
  background: rgb(120 124 134 / 0.22);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  mix-blend-mode: normal;
  opacity: 1;
  transition: opacity 0.3s ease-out;
}
.market-pass[data-state="locked"] .market-label {
  opacity: 0.9;
  transition: opacity 0.3s ease-out;
}
.market-pass[data-state="locked"] .market-logo {
  filter: saturate(0.35);
  transition: filter 0.3s ease-out;
}
.market-pass[data-state="locked"] .market-rate {
  opacity: 0.4;
}
.market-pass[data-fill="true"] .market-rate {
  animation: market-fill 0.5s ease-out backwards;
}
@keyframes market-fill {
  from {
    opacity: 0.4;
  }
}
.market-mini:is(:focus-visible, [data-peek="true"]) .market-pass.pass-card[data-state="locked"] .pass-face {
  filter: none;
}
.market-mini:is(:focus-visible, [data-peek="true"]) .market-pass.pass-card[data-state="locked"] .pass-face::after {
  opacity: 0;
}
.market-mini:is(:focus-visible, [data-peek="true"]) .market-pass[data-state="locked"] :is(.market-label, .market-rate) {
  opacity: 1;
}
.market-mini:is(:focus-visible, [data-peek="true"]) .market-pass[data-state="locked"] .market-logo {
  filter: none;
}
@media (hover: hover) {
  .market-mini:hover .market-pass.pass-card[data-state="locked"] .pass-face {
    filter: none;
  }
  .market-mini:hover .market-pass.pass-card[data-state="locked"] .pass-face::after {
    opacity: 0;
  }
  .market-mini:hover .market-pass[data-state="locked"] :is(.market-label, .market-rate) {
    opacity: 1;
  }
  .market-mini:hover .market-pass[data-state="locked"] .market-logo {
    filter: none;
  }
}
.market-boost {
  --deck-w: 8rem;
  --deck-rise: 0.75rem;
  container: market-boost / inline-size;
}
.market-boost-row {
  display: flex;
  align-items: stretch;
  gap: 1rem;
}
.market-boost-deck {
  width: var(--deck-w);
  padding-top: var(--deck-rise);
}
.market-boost-copy {
  padding-top: var(--deck-rise);
}
@container market-boost (max-width: 359px) {
  .market-boost-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  .market-boost-copy {
    padding-top: 0;
  }
}
.market-boost-deck .market-mini {
  --mini-w: var(--deck-w);
}
.market-boost-front {
  position: relative;
  display: block;
  animation: market-deal 0.5s ${EASE} both;
}
.market-boost-back {
  position: absolute;
  left: 0;
  top: var(--deck-rise);
  display: block;
  pointer-events: none;
  transform-origin: 50% 0;
  transition: transform 0.5s ${EASE}, opacity 0.5s ${EASE};
}
.market-boost-back .market-mini {
  filter: brightness(0.6) saturate(0.8) drop-shadow(0 0.2rem 0.3rem rgb(0 0 0 / 0.5));
}
.market-boost-back .market-label {
  visibility: hidden;
}
.market-boost-back[data-depth="1"] {
  transform: translateY(calc(var(--deck-rise) * -0.5)) scale(0.92);
  opacity: 0.85;
}
.market-boost-back[data-depth="2"] {
  transform: translateY(calc(var(--deck-rise) * -1)) scale(0.84);
  opacity: 0.6;
}
@keyframes market-deal {
  from {
    opacity: 0;
    transform: translateY(calc(var(--deck-rise) * -0.5)) scale(0.94);
  }
}
.market-hero:has(.pass-flip:not([data-phase="closed"])) {
  z-index: 60;
}
.market-hero .pass-rise {
  animation-duration: 0.6s;
}
@media (prefers-reduced-motion: reduce) {
  .market-mini,
  .market-boost-back,
  .market-pass[data-state="locked"] :is(.pass-face, .market-label, .market-logo),
  .market-mini .market-pass.pass-card[data-state="locked"] .pass-face::after {
    transition: none;
  }
  .market-mini,
  .market-mini:hover {
    --lift: 0px;
    --rx: 0deg;
    --ry: 0deg;
  }
  .market-hero .pass-rise,
  .market-boost-front,
  .market-pass[data-fill="true"] .market-rate {
    animation: none;
  }
}
`
