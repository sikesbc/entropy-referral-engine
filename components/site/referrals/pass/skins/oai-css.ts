const S = '.pass-card[data-skin="OAI"]'

export const OAI_CSS = `
${S} {
  --ink: #ededee;
  --qr-bg: #0a0a0b;
}
${S} .pass-face {
  background-color: #0c0c0d;
  background-image:
    radial-gradient(130% 100% at 15% 0%, rgb(255 255 255 / 0.075) 0%, rgb(255 255 255 / 0) 55%),
    radial-gradient(100% 110% at 100% 100%, rgb(0 0 0 / 0.55) 0%, rgb(0 0 0 / 0) 60%),
    linear-gradient(180deg, #151517 0%, #0a0a0b 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.09), inset 0 0 0 1px rgb(255 255 255 / 0.035);
}
${S} .pass-market-logo {
  filter: invert(1);
}
${S} .pass-perf {
  border-color: rgb(255 255 255 / 0.13);
}
${S} .pass-sheen {
  background: radial-gradient(26rem circle at var(--mx) var(--my), rgb(255 255 255 / 0.07), rgb(255 255 255 / 0) 60%);
}
${S}[data-state="boosted"] .pass-face::after {
  mix-blend-mode: screen;
  opacity: 0.16;
  background: linear-gradient(115deg, #0000 30%, #ffffff 48%, #0000 66%) 0 0 / 250% 100%;
}
`
