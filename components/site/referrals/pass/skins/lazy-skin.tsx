"use client"

import { lazy, Suspense } from "react"
import type { Skin, SkinPart } from "./types"

type SkinSeed = {
  id: string
  name: string
  logo: string
  vars: string
  face: string
  load: () => Promise<Skin>
}

export function lazySkin({ id, name, logo, vars, face, load }: SkinSeed): Skin {
  const S = `.pass-card[data-skin="${id}"]`
  const Visual = lazy(async () => {
    const skin = await load()
    function Loaded({ part }: { part: SkinPart }) {
      return (
        <>
          <style href={`ticket-skin-art-${skin.id}`} precedence="default">
            {skin.css}
          </style>
          <skin.Art part={part} />
        </>
      )
    }
    return { default: Loaded }
  })

  function Art({ part }: { part: SkinPart }) {
    return (
      <Suspense fallback={null}>
        <Visual part={part} />
      </Suspense>
    )
  }

  return {
    id,
    name,
    logo,
    css: `${S} { ${vars} } ${S} .pass-face { background-color: ${face}; }`,
    Art,
  }
}
