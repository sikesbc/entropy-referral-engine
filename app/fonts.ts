import localFont from "next/font/local"

export const entropyCiburial = localFont({
  src: [
    { path: "./fonts/EntropyCiburial-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/EntropyCiburial-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/EntropyCiburial-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-entropy-ciburial",
  display: "block",
  adjustFontFallback: false,
  fallback: [],
})

export const entropyMono = localFont({
  src: [
    { path: "./fonts/EntropyMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/EntropyMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-entropy-mono",
  display: "block",
  adjustFontFallback: false,
  fallback: [],
})

export const lctCiburial = localFont({
  src: "./fonts/LCT-Ciburial-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-lct-ciburial",
  display: "optional",
  adjustFontFallback: false,
  fallback: [],
})

export const newsreader = localFont({
  src: "./fonts/Newsreader-Variable.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
  fallback: [],
  preload: false,
})

export const fontVariables = [entropyCiburial, entropyMono, lctCiburial, newsreader]
  .map((font) => font.variable)
  .join(" ")
