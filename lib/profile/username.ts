export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30

export function usernameError(value: string): string | null {
  const name = value.trim()
  if (/^0x[0-9a-f]{40}$/i.test(name)) return null
  if (name.length < USERNAME_MIN_LENGTH || name.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters`
  }
  if (!/^[A-Za-z0-9_]+$/.test(name)) return "Username can only use letters, numbers and underscores"
  if (name.endsWith("_")) return "Username cannot end with an underscore"
  return null
}

const joinedFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })

export function formatJoined(createdAt: string | null | undefined): string | null {
  if (!createdAt) return null
  const time = Date.parse(createdAt)
  return Number.isFinite(time) ? `Joined ${joinedFormat.format(time)}` : null
}
