"use client"

import { useState } from "react"
import { localAssetUrl } from "@/lib/assets"
import { avatarGradient } from "@/lib/avatar"
import { cn } from "@/lib/utils"

export function WalletAvatar({
  seed,
  src,
  size = 28,
  title,
  className,
}: {
  seed: string | null | undefined
  src?: string | null
  size?: number | string
  title?: string
  className?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const local = src && !src.includes("/profile-images/presets/") ? localAssetUrl(src) : null
  const image = local && local !== failedSrc ? local : null
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={cn("relative block shrink-0 overflow-hidden rounded-full bg-cover", className)}
      style={{ width: size, height: size, aspectRatio: "1 / 1", backgroundImage: avatarGradient(seed) }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          onError={() => setFailedSrc(image)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </span>
  )
}
