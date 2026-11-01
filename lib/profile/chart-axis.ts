const MINUTE_MS = 60_000
const DAY_MS = 86_400_000

const seconds = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
const minutes = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" })
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" })
const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" })

export function formatAxisTime(time: number, span: number): string {
  if (span < 3 * MINUTE_MS) return seconds.format(time)
  if (span < 1.5 * DAY_MS) return minutes.format(time)
  if (span < 8 * DAY_MS) return weekday.format(time)
  if (span < 400 * DAY_MS) return monthDay.format(time)
  return monthYear.format(time)
}

export const AXIS_TICK_COUNT = 5
