const S = '.pass-card[data-skin="NVDA"]'

export const NVDA_CSS = `
${S} {
  --ink: #f4f7f0;
  --qr-bg: #05200f;
}
${S} .pass-face {
  background-color: #0c4625;
  background-image:
    linear-gradient(115deg, rgb(255 255 255 / 0) 32%, rgb(220 255 210 / 0.07) 44%, rgb(255 255 255 / 0) 56%),
    radial-gradient(120% 90% at 8% 0%, rgb(120 210 120 / 0.2) 0%, rgb(120 210 120 / 0) 55%),
    radial-gradient(110% 120% at 100% 100%, rgb(0 20 8 / 0.5) 0%, rgb(0 20 8 / 0) 60%),
    repeating-linear-gradient(45deg, rgb(255 255 255 / 0.018) 0 1px, rgb(255 255 255 / 0) 1px 4px),
    repeating-linear-gradient(-45deg, rgb(0 0 0 / 0.04) 0 1px, rgb(0 0 0 / 0) 1px 4px),
    linear-gradient(165deg, #125a31 0%, #0b4322 55%, #083519 100%);
  box-shadow: inset 0 1px 0 rgb(200 255 190 / 0.18), inset 0 0 0 1px rgb(200 255 190 / 0.06);
}
${S} .pass-face > .relative,
${S} .pass-cut {
  text-shadow: 0 1px 0 rgb(0 30 10 / 0.45);
}
${S} .pass-perf {
  border-color: rgb(244 247 240 / 0.5);
}
${S} .nvda-pulse {
  opacity: 0;
}
${S}[data-state="boosted"] .nvda-pulse {
  opacity: 1;
  animation: nvda-flow 2.6s linear infinite;
}
${S}[data-state="boosted"] .pass-face::after {
  mix-blend-mode: screen;
  opacity: 0.28;
  background: linear-gradient(115deg, #0000 25%, #76b900 40%, #f2d37a 50%, #76b900 60%, #0000 75%) 0 0 / 250% 100%;
}
@keyframes nvda-flow {
  from { stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  ${S}[data-state="boosted"] .nvda-pulse { animation: none; stroke-dashoffset: 400; }
}
`
