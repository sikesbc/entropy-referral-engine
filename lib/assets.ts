import logoFiles from "./logo-manifest.json"

const LOGO_HOST = "https://assets.entropy.trade/logos/"
const IMAGE_DELIVERY_HOST = "https://imagedelivery.net/"
const HYPERDASH_HOST = "https://cdn.hyperdash.io/"
const HYPERDASH_FILES = new Set(["machibigbrother.jpg"])
const LOGO_FILES: Record<string, string> = logoFiles

export function marketLogoSrc(coin: string): string {
  const key = coin.replace(":", "_")
  return `/logos/${LOGO_FILES[key] ?? `${key}.svg`}`
}

export function localAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith(LOGO_HOST)) {
    const file = decodeURIComponent(url.slice(LOGO_HOST.length).split("?")[0])
    return marketLogoSrc(file.replace(/\.svg$/, ""))
  }
  if (url.startsWith(IMAGE_DELIVERY_HOST)) {
    return `/imagedelivery/${url.slice(IMAGE_DELIVERY_HOST.length).split("?")[0]}.avif`
  }
  if (url.startsWith(HYPERDASH_HOST)) {
    const file = decodeURIComponent(url.slice(HYPERDASH_HOST.length).split("?")[0])
    return HYPERDASH_FILES.has(file) ? `/hyperdash/${file}` : null
  }
  return url.startsWith("/") ? url : null
}
