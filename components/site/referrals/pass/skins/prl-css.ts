const S = '.pass-card[data-skin="PRL"]'

export const PRL_CSS = `
${S} {
  --ink: #26222e;
  --qr-bg: #fbf9f7;
}
${S} .pass-face {
  background-color: #efebe6;
  background-image:
    radial-gradient(120% 90% at 0% 0%, #fbf3f4 0%, rgb(251 243 244 / 0) 55%),
    radial-gradient(110% 120% at 100% 100%, rgb(150 160 190 / 0.18) 0%, rgb(150 160 190 / 0) 60%),
    linear-gradient(160deg, #f4efea 0%, #ece8f0 50%, #e7efec 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.95), inset 0 0 0 1px rgb(120 110 140 / 0.14);
}
${S} .pass-face > .relative,
${S} .pass-cut {
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.6);
}
${S} .pass-brand {
  filter: invert(1);
  opacity: 0.86;
}
${S} .pass-market-logo {
  mix-blend-mode: multiply;
}
${S} .pass-perf {
  border-color: rgb(60 50 80 / 0.26);
}
${S} .pass-qr {
  filter: drop-shadow(0 1px 0 rgb(255 255 255 / 0.7));
}
${S} .pass-sheen {
  mix-blend-mode: soft-light;
  background: radial-gradient(26rem circle at var(--mx) var(--my), rgb(255 255 255 / 0.9), rgb(255 255 255 / 0) 60%);
}
${S} .prl-lustre {
  background: conic-gradient(from 30deg at var(--mx) var(--my), #ffd2e4, #d3d9ff, #c9f5e6, #fff0c9, #f3d0ff, #ffd2e4);
  mix-blend-mode: soft-light;
  opacity: calc(0.35 + var(--glow) * 0.45);
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
${S}[data-state="locked"] .pass-face {
  filter: grayscale(1) brightness(0.97) contrast(0.9);
}
${S}[data-state="locked"] .pass-face::after {
  background: rgb(236 234 232 / 0.3);
}
${S}[data-state="boosted"] .pass-face::after {
  mix-blend-mode: multiply;
  opacity: 0.5;
  background: linear-gradient(115deg, #0000 20%, #ffc4dc 35%, #c4d2ff 45%, #c2f7e2 55%, #ffecc2 65%, #0000 80%) 0 0 / 250% 100%;
}
`
