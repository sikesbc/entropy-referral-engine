import type { AuthHeaders } from "./wallet"
import type {
  CodeLookup,
  Eligibility,
  ReferralsResponse,
  SignupRequest,
  SignupResponse,
  SiteMe,
  UsernameAvailability,
} from "./types"

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

type ErrorBody = { error?: { code?: string; message?: string } }

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, cache: "no-store" })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = (body as ErrorBody | null)?.error
    throw new ApiError(
      response.status,
      error?.code ?? "error",
      error?.message ?? "The request failed. Try again.",
    )
  }
  return body as T
}

export function fetchMe(headers: AuthHeaders): Promise<SiteMe> {
  return call("/api/site/me", { headers })
}

export function fetchReferrals(headers: AuthHeaders): Promise<ReferralsResponse> {
  return call("/api/site/referrals", { headers })
}

export function fetchCode(code: string): Promise<CodeLookup> {
  return call(`/api/site/codes/${encodeURIComponent(code)}`, {})
}

export function fetchEligibility(address: string): Promise<Eligibility> {
  return call(`/api/site/eligibility?address=${encodeURIComponent(address)}`, {})
}

export function fetchUsernameAvailability(username: string): Promise<UsernameAvailability> {
  return call(`/api/site/usernames/${encodeURIComponent(username)}`, {})
}

export function postSignup(headers: AuthHeaders, request: SignupRequest): Promise<SignupResponse> {
  return call("/api/site/signup", {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify(request),
  })
}
