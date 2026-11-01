import { useId } from "react"
import type { SkinPart } from "./types"

const LOGO = "/logos/io_OAI.png"

function Matte({ uid }: { uid: string }) {
  return (
    <svg width="900" height="520" className="absolute left-0 top-0 max-w-none">
      <filter id={`${uid}-matte`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.16 0 0 0 -0.05" />
      </filter>
      <rect width="900" height="520" filter={`url(#${uid}-matte)`} />
    </svg>
  )
}

function Blossom({ uid }: { uid: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute right-[-44%] top-1/2 aspect-square h-[120%] -translate-y-1/2 max-w-none"
    >
      <defs>
        <filter id={`${uid}-inv`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix values="-1 0 0 0 1  -1 0 0 0 1  -1 0 0 0 1  0 0 0 0 1" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="2.4" intercept="-0.7" />
            <feFuncG type="linear" slope="2.4" intercept="-0.7" />
            <feFuncB type="linear" slope="2.4" intercept="-0.7" />
          </feComponentTransfer>
        </filter>
        <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
          <image href={LOGO} width="400" height="400" filter={`url(#${uid}-inv)`} />
        </mask>
        <linearGradient id={`${uid}-glaze`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f1f22" />
          <stop offset="0.5" stopColor="#111113" />
          <stop offset="1" stopColor="#09090a" />
        </linearGradient>
        <filter id={`${uid}-relief`} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="2.6"
            specularConstant="0.2"
            specularExponent="14"
            lightingColor="#ffffff"
            result="spec"
          >
            <feDistantLight azimuth="225" elevation="30" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="gloss" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="soft" />
          <feOffset in="soft" dx="3" dy="5" result="drop" />
          <feFlood floodColor="#000" floodOpacity="0.85" />
          <feComposite in2="drop" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="gloss" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${uid}-relief)`}>
        <rect width="400" height="400" fill={`url(#${uid}-glaze)`} mask={`url(#${uid}-mask)`} />
      </g>
    </svg>
  )
}

export function OaiArt({ part }: { part: SkinPart }) {
  const uid = `oa${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Matte uid={uid} />
      {part === "body" ? <Blossom uid={uid} /> : null}
    </span>
  )
}
