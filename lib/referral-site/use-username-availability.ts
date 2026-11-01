"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchUsernameAvailability } from "./api"
import { checkUsername } from "./mock-api"
import { useSiteWallet } from "./wallet"

const STALE_MS = 30_000

export function useSiteUsernameAvailability(username: string, { enabled }: { enabled: boolean }) {
  const { demo } = useSiteWallet()
  return useQuery({
    queryKey: ["site", "username", demo, username.toLowerCase()],
    queryFn: async () => (demo ? checkUsername(username) : fetchUsernameAvailability(username)),
    enabled,
    staleTime: STALE_MS,
    retry: false,
  })
}
