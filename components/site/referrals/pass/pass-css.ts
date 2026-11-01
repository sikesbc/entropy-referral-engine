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

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)"

const NOTCH_CUT = "#0000 var(--notch), #000 calc(var(--notch) + 0.5px)"

function backNotches(a: string, b: string): string {
  const layers = `radial-gradient(circle at ${a}, ${NOTCH_CUT}), radial-gradient(circle at ${b}, ${NOTCH_CUT})`
  return `-webkit-mask: ${layers};\n  -webkit-mask-composite: source-in;\n  mask: ${layers};\n  mask-composite: intersect;`
}

const ORANGE = "linear-gradient(180deg, #ff7d55 0%, #fc6134 55%, #e8521f 100%)"

export const PASS_CSS = `
.pass-stage {
  perspective: 1800px;
  container: pass-card / inline-size;
}
.pass-card {
  --notch: 0.9rem;
  --radius: 1.25rem;
  --ink: #e9e9ec;
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 0%;
  --glow: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  color: var(--ink);
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 2.2rem 2.4rem rgb(0 0 0 / 0.6)) drop-shadow(0 0.4rem 0.6rem rgb(0 0 0 / 0.4));
}
.pass-card[data-active="true"] {
  transition-duration: 0.18s;
}
.pass-ticket {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.pass-face {
  position: relative;
  overflow: hidden;
  background-color: #1b1d22;
  background-image:
    linear-gradient(115deg, rgb(255 255 255 / 0) 30%, rgb(255 255 255 / 0.07) 45%, rgb(255 255 255 / 0) 60%),
    radial-gradient(120% 140% at 0% 0%, rgb(160 166 180 / 0.22) 0%, rgb(160 166 180 / 0) 55%),
    radial-gradient(100% 120% at 100% 100%, rgb(0 0 0 / 0.45) 0%, rgb(0 0 0 / 0) 60%),
    repeating-linear-gradient(90deg, rgb(255 255 255 / 0.025) 0 1px, rgb(255 255 255 / 0) 1px 2px),
    linear-gradient(180deg, #2a2d34 0%, #17191d 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12), inset 0 0 0 1px rgb(255 255 255 / 0.05);
}
.pass-body {
  border-radius: var(--radius) var(--radius) 0 0;
  ${notches("bl", "br")}
}
.pass-stub {
  ${notches("tl", "tr", "bl", "br")}
}
.pass-stub {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.5rem 1.5rem 1.5rem;
}
.pass-cut {
  position: relative;
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}
.pass-cut-value {
  font-size: 4rem;
}
.pass-qr {
  position: relative;
  width: 6rem;
  height: 6rem;
}
.pass-perf {
  position: absolute;
  top: 0;
  left: calc(var(--notch) + 0.4rem);
  right: calc(var(--notch) + 0.4rem);
  height: 0;
  border-top: 2px dotted rgb(255 255 255 / 0.18);
}
.pass-slot {
  position: relative;
}
.pass-strip {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 3rem;
  overflow: hidden;
  cursor: pointer;
  outline: none;
  background: #121317;
  border-radius: 0 0 var(--radius) var(--radius);
  ${notches("tl", "tr")}
}
.pass-strip-fill,
.pass-tear-face {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.95rem 1.5rem 0.9rem;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 1px rgb(120 30 0 / 0.35);
  background: ${ORANGE};
  box-shadow: inset 0 -1px rgb(0 0 0 / 0.18);
}
.pass-strip-fill {
  transition: filter 0.15s ease-out;
}
.pass-strip-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  transition: transform 0.2s ease-out;
}
.pass-strip:hover .pass-strip-fill {
  filter: brightness(1.08) saturate(1.04);
}
.pass-strip:hover .pass-strip-icon {
  transform: translate(0.1rem, -0.1rem);
}
.pass-strip:active .pass-strip-fill {
  filter: brightness(0.96);
}
.pass-strip-perf {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: calc(var(--notch) + 0.4rem);
  right: calc(var(--notch) + 0.4rem);
  height: 0;
  border-top: 2px dotted rgb(255 255 255 / 0.55);
}
.pass-strip:focus-visible::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0.3rem calc(var(--notch) + 0.3rem) 0.3rem;
  border-radius: 0.45rem 0.45rem 0.95rem 0.95rem;
  box-shadow: 0 0 0 2px rgb(255 255 255 / 0.95);
}
.pass-tear {
  --tooth: 0.32rem;
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  overflow: hidden;
  border-radius: 0 0 var(--radius) var(--radius);
  transform-origin: 0 0;
  ${notches("tl", "tr")}
  animation:
    pass-tear 0.45s cubic-bezier(0.22, 1, 0.36, 1) both,
    pass-tear-fade 0.45s ease-out both;
}
.pass-tear-face {
  -webkit-mask:
    conic-gradient(from 135deg at 50% 0, #000 90deg, #0000 0) 0 0 / calc(var(--tooth) * 2) var(--tooth) repeat-x,
    linear-gradient(#000 0 0) 0 var(--tooth) / 100% 100% no-repeat;
  mask:
    conic-gradient(from 135deg at 50% 0, #000 90deg, #0000 0) 0 0 / calc(var(--tooth) * 2) var(--tooth) repeat-x,
    linear-gradient(#000 0 0) 0 var(--tooth) / 100% 100% no-repeat;
}
@keyframes pass-tear {
  to {
    transform: translate(0.8rem, 2.4rem) rotate(7deg);
  }
}
@keyframes pass-tear-fade {
  0%,
  45% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.pass-sheen {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: var(--glow);
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: radial-gradient(28rem circle at var(--mx) var(--my), rgb(255 255 255 / 0.14), rgb(255 255 255 / 0) 60%);
  mix-blend-mode: screen;
}
.pass-rise {
  animation: pass-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes pass-rise {
  from {
    opacity: 0;
    transform: translateY(2rem) rotateX(14deg) scale(0.97);
  }
}
@keyframes pass-fade {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }
}
@container pass-card (min-width: 34rem) {
  .pass-ticket {
    flex-direction: row;
  }
  .pass-body {
    border-radius: var(--radius) 0 0 0;
    ${notches("tr", "bl")}
  }
  .pass-stub {
    width: 12rem;
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem 1.75rem;
    ${notches("tl", "br")}
  }
  .pass-cut-value {
    font-size: 6rem;
  }
  .pass-qr {
    width: 6.5rem;
    height: 6.5rem;
  }
  .pass-perf {
    top: calc(var(--notch) + 0.4rem);
    bottom: 0;
    left: 0;
    right: auto;
    height: auto;
    border-top: 0;
    border-left: 2px dotted rgb(255 255 255 / 0.18);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pass-card {
    transform: none;
    transition: none;
  }
  .pass-sheen,
  .pass-tear {
    display: none;
  }
  .pass-strip-fill,
  .pass-strip-icon {
    transition: none;
  }
  .pass-rise {
    animation: none;
  }
}

.pass-card[data-state="locked"] .pass-face {
  filter: grayscale(1) brightness(0.8);
}
.pass-card[data-state="locked"] .pass-face::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: rgb(20 21 24 / 0.35);
  backdrop-filter: blur(2px);
}
.pass-card[data-state="boosted"] .pass-face::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: color-dodge;
  opacity: 0.35;
  background: linear-gradient(115deg, #0000 20%, #ff9de2 35%, #9de6ff 45%, #c6ff9d 55%, #ffe59d 65%, #0000 80%) 0 0 / 250% 100%;
  animation: pass-foil 4.5s linear infinite;
}
@keyframes pass-foil {
  to { background-position: -250% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .pass-card[data-state="boosted"] .pass-face::after { animation: none; }
}

.pass-copy {
  display: inline-flex;
  height: 2.75rem;
  align-items: center;
  flex-shrink: 0;
  gap: 0.55rem;
  padding: 0 1.25rem;
  border-radius: 0.8rem;
  white-space: nowrap;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  text-shadow: 0 1px 1px rgb(120 30 0 / 0.35);
  background: ${ORANGE};
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px rgb(0 0 0 / 0.18), 0 0.8rem 1.6rem -0.8rem rgb(252 97 52 / 0.6);
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), filter 0.15s ease-out;
}
.pass-copy:hover {
  filter: brightness(1.06);
}
.pass-copy:active {
  transform: scale(0.97);
}
.pass-copy:focus-visible {
  outline: 2px solid #ff9a7a;
  outline-offset: 2px;
}
.pass-pop {
  display: inline-flex;
  animation: pass-pop 0.32s ${EXPO} both;
}
@keyframes pass-pop {
  from {
    opacity: 0;
    transform: translateY(0.2rem) scale(0.8);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pass-pop {
    animation: none;
  }
}
.pass-card[data-share="below"] .pass-stub {
  border-radius: 0 0 var(--radius) var(--radius);
  ${notches("tl", "tr")}
}
@container pass-card (min-width: 34rem) {
  .pass-card[data-share="below"] .pass-body {
    border-radius: var(--radius) 0 0 var(--radius);
    padding: 2rem 2.25rem;
    gap: 1.5rem;
    ${notches("tr", "br")}
  }
  .pass-card[data-share="below"] .pass-stub {
    width: 11rem;
    padding: 1.75rem 1.5rem;
    justify-content: space-between;
    border-radius: 0 var(--radius) var(--radius) 0;
    ${notches("tl", "bl")}
  }
  .pass-card[data-share="below"] .pass-perf {
    top: calc(var(--notch) + 0.4rem);
    bottom: calc(var(--notch) + 0.4rem);
  }
  .pass-card[data-share="below"] .pass-cut-value {
    font-size: 4.75rem;
  }
  .pass-card[data-share="below"] .pass-qr {
    width: 5rem;
    height: 5rem;
  }
  .pass-card[data-share="below"] .pass-name {
    font-size: min(6.5rem, var(--name-fit)) !important;
  }
}
.pass-flip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
.pass-flip > .pass-stage {
  position: relative;
  z-index: 1;
  align-self: stretch;
}
.pass-scrim {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  background: color-mix(in srgb, var(--color-panel, #12141a) 88%, transparent);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  transition: opacity 0.45s ${EXPO}, visibility 0s linear 0.45s;
}
.pass-flip[data-phase="open"] .pass-scrim {
  pointer-events: auto;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.45s ${EXPO}, visibility 0s;
}
.pass-fit {
  width: 100%;
  container: pass-fit / inline-size;
}
.pass-fit .pass-bar {
  flex-wrap: wrap;
  row-gap: 0.25rem;
  overflow: visible;
}
@container pass-fit (min-width: 28rem) {
  .pass-fit .pass-stage,
  .pass-fit .pass-bar {
    zoom: 0.78;
  }
}
@container pass-fit (max-width: 27.98rem) {
  .pass-fit .pass-bar {
    justify-content: space-between;
  }
  .pass-fit .pass-bar .pass-copy {
    flex-basis: 100%;
    justify-content: center;
    margin-right: 0;
  }
  .pass-fit .pass-bar-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
.pass-card[data-share="below"] .pass-cut-note {
  min-height: calc(1.35em * 3);
}
.pass-card[data-locked="true"] .pass-ticket {
  cursor: default;
}
.pass-lock {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  padding: 1.5rem;
  text-align: center;
  color: #fff;
}
.pass-lock-icon {
  width: 1.5rem;
  height: 1.5rem;
  opacity: 0.9;
}
.pass-lock-note {
  max-width: 18rem;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.35;
  text-wrap: balance;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.45);
}
.pass-lock-bar {
  display: block;
  width: min(14rem, 70%);
  height: 0.25rem;
  border-radius: 999px;
  overflow: hidden;
  background: rgb(255 255 255 / 0.22);
}
.pass-lock-bar > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #fff;
}
.pass-card[data-share="below"] {
  perspective: 1800px;
}
.pass-card[data-flipped="true"] {
  transform: none;
}
.pass-card[data-flipped="true"] .pass-sheen {
  opacity: 0;
}
.pass-card[data-share="below"] .pass-ticket {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ${EXPO};
}
.pass-card[data-share="below"] .pass-ticket:focus {
  outline: none;
}
.pass-card[data-flipped="true"] .pass-ticket {
  transform: rotateY(180deg);
  cursor: default;
}
.pass-card[data-share="below"] .pass-face {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.pass-card[data-share="below"][data-state] .pass-back.pass-face {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  container: pass-back / inline-size;
  border-radius: var(--radius);
  transform: rotateY(180deg);
  filter: none;
  cursor: default;
  ${backNotches("0 var(--perf-y, 60%)", "100% var(--perf-y, 60%)")}
}
.pass-card[data-share="below"][data-state] .pass-back.pass-face::after {
  display: none;
}
.pass-back-art {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.4;
}
.pass-back-inner {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem 1.1rem;
  overflow-y: auto;
  scrollbar-width: none;
  color: var(--ink);
}
.pass-back-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 0.25rem;
}
.pass-tile:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
.pass-back-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}
.pass-tile {
  display: flex;
  min-width: 0;
  min-height: 2.6rem;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.75rem;
  color: var(--ink);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.1;
  text-align: left;
  text-shadow: none;
  background: color-mix(in srgb, var(--ink) 9%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 14%, transparent);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s ease-out, transform 0.15s ${EXPO};
}
.pass-tile:hover {
  background: color-mix(in srgb, var(--ink) 16%, transparent);
}
.pass-tile:active {
  transform: scale(0.97);
}
.pass-tile:disabled {
  cursor: progress;
}
.pass-tile-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
  color: inherit;
  opacity: 0.85;
}
.pass-tile-label {
  min-width: 0;
  overflow-wrap: anywhere;
}
.pass-tile[data-primary="true"] {
  color: #fff;
  text-shadow: 0 1px 1px rgb(120 30 0 / 0.35);
  background: ${ORANGE};
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px rgb(0 0 0 / 0.18), 0 0.6rem 1.2rem -0.7rem rgb(252 97 52 / 0.7);
}
.pass-tile[data-primary="true"] .pass-tile-icon {
  opacity: 1;
}
.pass-tile[data-primary="true"]:hover {
  background: ${ORANGE};
  filter: brightness(1.06);
}
.pass-tile[data-primary="true"]:focus-visible {
  outline-color: #ff9a7a;
}
.pass-back-ask {
  margin-top: auto;
  padding: 0.85rem 0.25rem 0;
  border-top: 1px solid color-mix(in srgb, var(--ink) 14%, transparent);
  animation: pass-ask-rise 0.15s ease-out both;
}
@keyframes pass-ask-rise {
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }
}
.pass-back-ask :is(label, p) {
  color: color-mix(in srgb, var(--ink) 80%, transparent);
}
.pass-back-ask input {
  color: var(--ink);
  border-color: color-mix(in srgb, var(--ink) 22%, transparent);
  background: color-mix(in srgb, var(--ink) 5%, transparent);
}
.pass-back-ask input::placeholder {
  color: color-mix(in srgb, var(--ink) 50%, transparent);
}
.pass-back-ask input:focus-visible {
  border-color: color-mix(in srgb, var(--ink) 60%, transparent);
}
.pass-back-ask .lite-primary:not(:disabled),
.pass-back-ask button[type="submit"] {
  color: var(--ink);
  font-weight: 600;
  text-shadow: none;
  background: color-mix(in srgb, var(--ink) 14%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 18%, transparent);
}
.pass-back-ask .lite-primary:not(:disabled):hover {
  transform: none;
  background: color-mix(in srgb, var(--ink) 20%, transparent);
}
@container pass-back (min-width: 30rem) {
  .pass-back-inner {
    padding: 1.25rem 1.75rem;
  }
  .pass-tile {
    padding: 0.35rem 0.85rem;
    white-space: nowrap;
  }
  .pass-back-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@container pass-card (min-width: 34rem) {
  .pass-card[data-share="below"][data-state] .pass-back.pass-face {
    ${backNotches("11rem 0", "11rem 100%")}
  }
}
@media (prefers-reduced-motion: reduce) {
  .pass-card[data-share="below"] .pass-ticket,
  .pass-card[data-flipped="true"] .pass-ticket {
    transform: none;
    transition: none;
  }
  .pass-card[data-share="below"] .pass-face {
    transition: opacity 0.2s ease-out;
  }
  .pass-card[data-share="below"][data-state] .pass-back.pass-face {
    transform: none;
    opacity: 0;
  }
  .pass-card[data-flipped="true"][data-state] .pass-back.pass-face {
    opacity: 1;
  }
  .pass-card[data-flipped="true"] .pass-face:not(.pass-back) {
    opacity: 0;
  }
  .pass-scrim,
  .pass-flip[data-phase="open"] .pass-scrim {
    transition: none;
  }
  .pass-back-ask {
    animation: none;
  }
}
`
