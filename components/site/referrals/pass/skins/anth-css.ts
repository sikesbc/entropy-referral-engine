const S = '.pass-card[data-skin="ANTH"]'

export const ANTH_CSS = `
${S} {
  --ink: #1e1c19;
  --qr-bg: #f4efe4;
}
${S} .pass-face {
  background-color: #ede6d7;
  background-image:
    radial-gradient(120% 90% at 8% 0%, rgb(255 255 255 / 0.6) 0%, rgb(255 255 255 / 0) 60%),
    radial-gradient(110% 120% at 100% 100%, rgb(150 118 76 / 0.14) 0%, rgb(150 118 76 / 0) 60%),
    linear-gradient(180deg, #f1ebde 0%, #e8e0cf 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.8), inset 0 0 0 1px rgb(120 95 60 / 0.12);
}
${S} .pass-face > .relative,
${S} .pass-cut {
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.7), 0 -0.5px 0 rgb(80 60 30 / 0.12);
}
${S} .pass-cut-value {
  color: #b5573a;
}
${S} .pass-brand {
  filter: invert(1);
  opacity: 0.88;
}
${S} .pass-market-logo {
  mix-blend-mode: multiply;
}
${S} .pass-perf {
  border-color: rgb(70 55 35 / 0.32);
}
${S} .pass-qr {
  mix-blend-mode: multiply;
}
${S} .pass-sheen {
  mix-blend-mode: soft-light;
}
${S}[data-state="locked"] .pass-face {
  filter: grayscale(1) brightness(0.97) contrast(0.9);
}
${S}[data-state="locked"] .pass-face::after {
  background: rgb(236 231 222 / 0.3);
}
${S}[data-state="boosted"] .pass-face::after {
  mix-blend-mode: multiply;
  opacity: 0.55;
  background: linear-gradient(115deg, #0000 25%, #f3d2bb 38%, #e7a985 50%, #f3d2bb 62%, #0000 75%) 0 0 / 250% 100%;
}
`
