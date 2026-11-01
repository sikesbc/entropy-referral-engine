"use client"

import { useMemo } from "react"
import { ApiError } from "./api"
import { useMe } from "./queries"
import type { SiteMe } from "./types"
import { useSiteWallet } from "./wallet"

export type Registration =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "unregistered" }
  | { status: "registered"; me: SiteMe }
  | { status: "error"; retry: () => void }

export function useRegistration(): Registration {
  const wallet = useSiteWallet()
  const me = useMe()
  const { ready, address, demo } = wallet
  const { data, error, isError, refetch } = me

  return useMemo<Registration>(() => {
    if (!ready) return { status: "loading" }
    if (!address) return { status: "signedOut" }
    if (demo) return { status: "unregistered" }
    if (data) return { status: "registered", me: data }
    if (error instanceof ApiError && error.status === 404) return { status: "unregistered" }
    if (isError) return { status: "error", retry: () => void refetch() }
    return { status: "loading" }
  }, [ready, address, demo, data, error, isError, refetch])
}
