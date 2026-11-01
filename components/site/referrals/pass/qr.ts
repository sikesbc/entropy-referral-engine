import { create } from "qrcode"

export const QR_QUIET = 4

const LOGO_MARGIN = 1
const LOGO_MAX_AREA = 0.2
const FINDER_SPAN = 9

export const ENTROPY_LOGO = {
  width: 235,
  height: 183,
  path:
    "M0 0H36V36H0Z" +
    "M36 183H21.1838C19.0621 183 17.0273 182.157 15.527 180.657L4.68629 169.816C1.68571 166.816 0 162.746 0 158.502V52H36V183Z" +
    "M88 131C88 139.837 95.1634 147 104 147H199V183H112.657C108.413 183 104.344 181.314 101.343 178.314L56.6863 133.657C53.6857 130.656 52 126.587 52 122.343V36H88V131Z" +
    "M199 52C199 43.1634 191.837 36 183 36H88V0H174.343C178.587 0 182.656 1.68571 185.657 4.68629L230.314 49.343C233.314 52.3436 235 56.4133 235 60.6567V147H199V52Z",
} as const

export type QrRect = { x: number; y: number; width: number; height: number }

export type QrShape = {
  size: number
  path: string
  clear: QrRect
  logo: QrRect & { scale: number }
}

function sameParity(value: number, count: number): number {
  return value % 2 === count % 2 ? value : value + 1
}

function clearZone(count: number): { width: number; height: number } {
  const limit = Math.min(LOGO_MAX_AREA * count * count, (count - FINDER_SPAN * 2) ** 2)
  let best = { width: 0, height: 0 }
  for (let width = sameParity(LOGO_MARGIN * 2 + 1, count); width <= count; width += 2) {
    const logoHeight = ((width - LOGO_MARGIN * 2) * ENTROPY_LOGO.height) / ENTROPY_LOGO.width
    const height = sameParity(Math.ceil(logoHeight + LOGO_MARGIN * 2), count)
    if (width * height > limit) break
    best = { width, height }
  }
  return best
}

export function qrShape(text: string): QrShape {
  const { modules } = create(text, { errorCorrectionLevel: "H" })
  const count = modules.size
  const zone = clearZone(count)
  const zoneCol = (count - zone.width) / 2
  const zoneRow = (count - zone.height) / 2
  const cleared = (row: number, col: number) =>
    row >= zoneRow && row < zoneRow + zone.height && col >= zoneCol && col < zoneCol + zone.width
  const dark = (row: number, col: number) => !cleared(row, col) && Boolean(modules.get(row, col))
  const parts: string[] = []
  for (let row = 0; row < count; row++) {
    let col = 0
    while (col < count) {
      if (!dark(row, col)) {
        col++
        continue
      }
      const start = col
      while (col < count && dark(row, col)) col++
      parts.push(`M${start + QR_QUIET} ${row + QR_QUIET}h${col - start}v1h${start - col}z`)
    }
  }
  const clear = { x: zoneCol + QR_QUIET, y: zoneRow + QR_QUIET, width: zone.width, height: zone.height }
  const scale = Math.min(
    (zone.width - LOGO_MARGIN * 2) / ENTROPY_LOGO.width,
    (zone.height - LOGO_MARGIN * 2) / ENTROPY_LOGO.height,
  )
  const logoWidth = ENTROPY_LOGO.width * scale
  const logoHeight = ENTROPY_LOGO.height * scale
  const logo = {
    x: clear.x + (zone.width - logoWidth) / 2,
    y: clear.y + (zone.height - logoHeight) / 2,
    width: logoWidth,
    height: logoHeight,
    scale,
  }
  return { size: count + QR_QUIET * 2, path: parts.join(""), clear, logo }
}

export function qrLogoTransform(logo: QrShape["logo"]): string {
  return `translate(${logo.x} ${logo.y}) scale(${logo.scale})`
}

export function qrSvg(text: string, ink: string, paper: string): string {
  const { size, path, logo } = qrShape(text)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${paper}"/><path d="${path}" fill="${ink}"/><path transform="${qrLogoTransform(logo)}" d="${ENTROPY_LOGO.path}" fill="${ink}" shape-rendering="geometricPrecision"/></svg>`
}
