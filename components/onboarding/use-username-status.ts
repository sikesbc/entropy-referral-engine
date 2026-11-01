"use client"

import { useUsernameAvailability } from "@/lib/api/account"
import { USERNAME_MIN_LENGTH } from "@/lib/referral-site/username"
import { USERNAME_CHECK_DELAY_MS } from "./onboarding-copy"
import { useDebouncedValue } from "./use-debounced-value"
import { usernameError } from "./username-rules"

export type UsernameAvailabilityQuery = (
  username: string,
  options: { enabled: boolean },
) => { isPending: boolean; isError: boolean; data?: { available: boolean } }

export type UsernameStatus = "idle" | "checking" | "available" | "unavailable" | "error"

export function useUsernameStatus(
  username: string,
  current: string | null,
  useAvailability: UsernameAvailabilityQuery = useUsernameAvailability,
): UsernameStatus {
  const valid = usernameError(username, false) === null && username.length >= USERNAME_MIN_LENGTH
  const isCurrent = !!current && username.toLowerCase() === current.toLowerCase()
  const debounced = useDebouncedValue(username, USERNAME_CHECK_DELAY_MS)
  const settled = debounced === username
  const query = useAvailability(debounced, { enabled: valid && !isCurrent && settled })
  if (!valid) return "idle"
  if (isCurrent) return "available"
  if (!settled || query.isPending) return "checking"
  if (query.isError || !query.data) return "error"
  return query.data.available ? "available" : "unavailable"
}
