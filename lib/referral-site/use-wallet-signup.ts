"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef, useState } from "react"
import { ApiError, postSignup } from "./api"
import type { SignupDemo } from "./demo"
import { lookupCode, mockSignup } from "./mock-api"
import type { SignupRequest, SignupResponse } from "./types"
import { useSignOut } from "./use-sign-out"
import { useSiteWallet, wait } from "./wallet"
import { WalletError, type WalletErrorKind } from "./wallet-errors"

const DEMO_SUBMIT_MS = 600
const DEMO_DECLINE_MS = 900
const UNKNOWN_CODE_MESSAGE = "That code doesn't belong to anyone. Check the spelling or skip it."

export type SignupState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "submitting"; address: string }
  | { status: "done"; result: SignupResponse }
  | { status: "error"; message: string; code: string | null; wallet: WalletErrorKind | null }

function errorState(error: unknown): SignupState {
  if (error instanceof WalletError)
    return { status: "error", message: error.message, code: null, wallet: error.kind }
  const code = error instanceof ApiError ? error.code : null
  const message =
    error instanceof ApiError && error.status < 500
      ? error.message
      : "Something went wrong while signing you up. Try again."
  return { status: "error", message, code, wallet: null }
}

function demoSignup(address: string, request: SignupRequest, demo: SignupDemo): SignupResponse {
  if (request.code?.trim() && lookupCode(request.code).status === "unknown" && demo !== "registered") {
    throw new ApiError(400, "unknown_code", UNKNOWN_CODE_MESSAGE)
  }
  return mockSignup(address, request, demo)
}

export function useWalletSignup(demo: SignupDemo | null) {
  const wallet = useSiteWallet()
  const queryClient = useQueryClient()
  const signOutWallet = useSignOut()
  const [state, setState] = useState<SignupState>({ status: "idle" })
  const declinedOnce = useRef(false)

  const declineOnceInDemo = useCallback(async () => {
    if (demo !== "rejected" || declinedOnce.current) return
    declinedOnce.current = true
    await wait(DEMO_DECLINE_MS)
    throw new WalletError("closed")
  }, [demo])

  const connect = useCallback(async (): Promise<boolean> => {
    if (wallet.address) return true
    setState({ status: "connecting" })
    try {
      await declineOnceInDemo()
      await wallet.connect()
      setState({ status: "idle" })
      return true
    } catch (error) {
      setState(errorState(error))
      return false
    }
  }, [wallet, declineOnceInDemo])

  const clearError = useCallback(() => {
    setState((current) => (current.status === "error" ? { status: "idle" } : current))
  }, [])

  const signOut = useCallback(async () => {
    await signOutWallet()
    declinedOnce.current = false
    setState({ status: "idle" })
  }, [signOutWallet])

  const start = useCallback(
    async (request: SignupRequest) => {
      try {
        let address = wallet.address
        if (!address) {
          setState({ status: "connecting" })
          address = await wallet.connect()
        }
        setState({ status: "submitting", address })
        let result: SignupResponse
        if (demo) {
          await declineOnceInDemo()
          await wait(DEMO_SUBMIT_MS)
          result = demoSignup(address, request, demo)
        } else {
          result = await postSignup(await wallet.authHeaders(address), request)
          await queryClient.invalidateQueries({ queryKey: ["site"] })
        }
        window.localStorage.removeItem("entropy:referrals-intro:v1")
        setState({ status: "done", result })
      } catch (error) {
        setState(errorState(error))
      }
    },
    [demo, wallet, queryClient, declineOnceInDemo],
  )

  return { state, connect, start, clearError, signOut }
}
