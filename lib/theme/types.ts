export type Theme = "dark" | "light"

export const THEME_COOKIE = "entropy_theme"

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light"
}

export function htmlThemeAttributes(theme: Theme) {
  return theme === "dark"
    ? { className: "dark", "data-theme": "" }
    : { className: undefined, "data-theme": "light" }
}
