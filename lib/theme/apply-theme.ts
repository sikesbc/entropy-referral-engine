import { htmlThemeAttributes, THEME_COOKIE, type Theme } from "./types"

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const attributes = htmlThemeAttributes(theme)
  root.classList.toggle("dark", attributes.className === "dark")
  root.dataset.theme = attributes["data-theme"]
}

export function persistTheme(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`
}
