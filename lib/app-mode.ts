export const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE === "1"

export function appModeEnabled(): boolean {
  return process.env.APP_MODE === "1" || process.env.NEXT_PUBLIC_APP_MODE === "1"
}
