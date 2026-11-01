import localFont from "next/font/local"

export const humane = localFont({
  src: "./Humane-VF.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["LCT Ciburial", "sans-serif"],
  preload: false,
})
