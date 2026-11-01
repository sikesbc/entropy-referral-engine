import { useMemo } from "react"
import { displayUrl } from "@/lib/referral-site/config"
import { ENTROPY_LOGO, qrLogoTransform, qrShape } from "./qr"

export function QrCode({ url }: { url: string }) {
  const { size, path, logo } = useMemo(() => qrShape(url), [url])
  return (
    <svg
      role="img"
      aria-label={`QR code for ${displayUrl(url)}`}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className="pass-qr block shrink-0"
    >
      <rect width={size} height={size} rx={2} fill="var(--qr-bg, #141518)" />
      <path d={path} fill="var(--ink)" />
      <path
        d={ENTROPY_LOGO.path}
        transform={qrLogoTransform(logo)}
        fill="var(--ink)"
        shapeRendering="geometricPrecision"
      />
    </svg>
  )
}
