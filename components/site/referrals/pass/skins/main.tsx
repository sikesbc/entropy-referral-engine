"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import type { Skin, SkinPart } from "./types"

const S = `.pass-card[data-skin="main"]`
const STILL = "/hero-media/shader-mark-silver.png"
const LIVE = "/hero-media/shader-mark-silver.mp4"

const css = `
${S} {
  --ink: oklch(0.95 0.004 265);
  --qr-bg: oklch(0.15 0.005 265);
  --mark-h: 100%;
  --mark-l: calc(70cqi + 2rem);
  --mark-b: -5rem;
  --name-room: 0.64;
}
${S} .pass-face {
  background-color: oklch(0.14 0.005 265);
  background-image:
    linear-gradient(176deg, rgb(236 240 250 / 0.09) 0%, rgb(236 240 250 / 0) 16%),
    linear-gradient(101deg, #0000 6%, rgb(226 232 246 / 0.06) 19%, #0000 31%, #0000 61%, rgb(226 232 246 / 0.035) 69%, #0000 77%),
    radial-gradient(90% 70% at 0% 0%, rgb(170 178 196 / 0.12) 0%, rgb(170 178 196 / 0) 60%),
    radial-gradient(120% 100% at 100% 110%, rgb(4 5 8 / 0.7) 0%, rgb(4 5 8 / 0) 62%),
    linear-gradient(180deg, oklch(0.2 0.006 265) 0%, oklch(0.135 0.005 265) 52%, oklch(0.105 0.004 265) 100%);
  box-shadow:
    inset 0 1px 0 rgb(240 244 252 / 0.2),
    inset 0 0 0 1px rgb(240 244 252 / 0.06),
    inset 0 -1px 0 rgb(0 0 0 / 0.65);
}
${S} .pass-stub {
  background-image:
    repeating-linear-gradient(0deg, rgb(255 255 255 / 0.028) 0 1px, rgb(255 255 255 / 0) 1px 3px),
    linear-gradient(176deg, rgb(236 240 250 / 0.08) 0%, rgb(236 240 250 / 0) 18%),
    radial-gradient(140% 80% at 100% 0%, rgb(170 178 196 / 0.14) 0%, rgb(170 178 196 / 0) 60%),
    linear-gradient(180deg, oklch(0.185 0.006 265) 0%, oklch(0.13 0.005 265) 60%, oklch(0.11 0.004 265) 100%);
}
${S} .pass-perf {
  border-color: rgb(236 240 250 / 0.2);
}
${S} .pass-name {
  font-size: min(9.5rem, calc(var(--name-fit) * var(--name-room))) !important;
  text-shadow: 0 0 0.6rem rgb(6 7 10 / 0.55), 0 0.1rem 0.2rem rgb(6 7 10 / 0.6);
}
${S} .pass-cut-value {
  text-shadow: 0 1px 0 rgb(6 7 10 / 0.8), 0 -1px 0 rgb(255 255 255 / 0.08);
}
${S} .pass-qr {
  border-radius: 0.35rem;
  box-shadow: 0 0 0 1px rgb(236 240 250 / 0.1), 0 1px 0 rgb(255 255 255 / 0.06), inset 0 1px 2px rgb(0 0 0 / 0.5);
}
${S} .pass-sheen {
  mix-blend-mode: screen;
  background:
    radial-gradient(7rem circle at var(--mx) var(--my), rgb(240 244 252 / 0.1), rgb(240 244 252 / 0) 70%),
    radial-gradient(32rem circle at var(--mx) var(--my), rgb(200 208 228 / 0.08), rgb(200 208 228 / 0) 60%);
}
@container pass-card (min-width: 34rem) {
  ${S}[data-share="below"] .pass-name {
    font-size: min(6.5rem, calc(var(--name-fit) * var(--name-room))) !important;
  }
}
${S} .main-mark {
  position: absolute;
  left: var(--mark-l);
  bottom: var(--mark-b);
  height: var(--mark-h);
  aspect-ratio: 704 / 552;
}
${S} .main-mark > img,
${S} .main-mark > video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
${S} .main-mark > img {
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
${S} .main-mark > video {
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
${S} .main-mark[data-playing="true"] > video {
  opacity: 1;
}
${S} .main-mark[data-playing="true"] > img {
  opacity: 0;
}
${S} :is(.main-horizon, .main-glint) {
  position: absolute;
  inset: 0;
  -webkit-mask: url(${STILL}) left var(--mark-l) bottom var(--mark-b) / auto var(--mark-h) no-repeat;
  mask: url(${STILL}) left var(--mark-l) bottom var(--mark-b) / auto var(--mark-h) no-repeat;
}
${S} .main-horizon {
  mix-blend-mode: multiply;
  background: linear-gradient(180deg, rgb(150 153 162) 0%, rgb(204 207 216) 20%, rgb(255 255 255) 36%, rgb(196 199 210) 44%, rgb(72 75 86) 49%, rgb(30 32 38) 51%, rgb(72 75 86) 58%, rgb(150 153 164) 75%, rgb(206 208 216) 100%) 0 calc(var(--my) * -0.3 + 25%) / 100% 200% no-repeat;
  transition: background-position 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
${S}[data-active="true"] .main-horizon {
  transition-duration: 0.18s;
}
${S} .main-glint {
  mix-blend-mode: overlay;
  opacity: var(--glow);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background:
    radial-gradient(38% 14% at var(--mx) var(--my), rgb(255 255 255 / 0.95), rgb(255 255 255 / 0) 100%),
    radial-gradient(16rem 8rem at calc(var(--mx) * -1 + 100%) calc(var(--my) * -1 + 100%), rgb(0 0 0 / 0.5), rgb(0 0 0 / 0) 100%);
}
${S} .main-streak {
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: calc(var(--mx) * 1.35 - 18%);
  width: 9rem;
  transform: translateX(-50%) skewX(-16deg);
  opacity: var(--glow);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  mix-blend-mode: screen;
  background: linear-gradient(90deg, rgb(230 236 250 / 0) 0%, rgb(230 236 250 / 0.05) 38%, rgb(240 244 252 / 0.12) 50%, rgb(230 236 250 / 0.05) 62%, rgb(230 236 250 / 0) 100%);
}
${S}[data-state="boosted"] .pass-face::after {
  mix-blend-mode: overlay;
  opacity: 0.6;
  background: linear-gradient(115deg, #0000 22%, rgb(255 255 255 / 0.55) 40%, rgb(196 206 228 / 0.85) 50%, rgb(255 255 255 / 0.55) 60%, #0000 78%) 0 0 / 250% 100%;
}
@media (prefers-reduced-motion: reduce) {
  ${S} .main-streak {
    display: none;
  }
  ${S} .main-horizon {
    transition: none;
  }
}
`

function useLive(host: RefObject<HTMLElement | null>) {
  const [live, setLive] = useState(false)
  useEffect(() => {
    const node = host.current
    if (!node || !node.closest(".pass-body") || node.closest(".market-scale, .pass-back-art")) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)")
    let idle = false
    const sync = () => setLive(idle && !still.matches)
    const ready = () => {
      idle = true
      sync()
    }
    const idleId =
      "requestIdleCallback" in window ? window.requestIdleCallback(ready, { timeout: 2500 }) : null
    const timeoutId = idleId === null ? window.setTimeout(ready, 200) : null
    still.addEventListener("change", sync)
    return () => {
      if (idleId !== null) window.cancelIdleCallback(idleId)
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      still.removeEventListener("change", sync)
    }
  }, [host])
  return live
}

function LiquidMark() {
  const hostRef = useRef<HTMLSpanElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const live = useLive(hostRef)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!live || !video) return
    const watch = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => setPlaying(false))
      else video.pause()
    })
    watch.observe(video)
    return () => {
      watch.disconnect()
      video.pause()
    }
  }, [live])

  return (
    <span ref={hostRef} className="main-mark" data-playing={live && playing}>
      <img src={STILL} alt="" draggable={false} />
      {live ? (
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="none"
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={LIVE} type="video/mp4" />
        </video>
      ) : null}
    </span>
  )
}

function Art({ part }: { part: SkinPart }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {part === "body" ? (
        <>
          <LiquidMark />
          <span className="main-horizon" />
          <span className="main-glint" />
        </>
      ) : null}
      <span className="main-streak" />
    </span>
  )
}

export const mainSkin: Skin = {
  id: "main",
  name: "io",
  logo: "/entropy-logo-white.svg",
  css,
  Art,
}
