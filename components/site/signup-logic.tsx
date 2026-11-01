"use client"

import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/components/onboarding/use-debounced-value"
import { fetchEligibility } from "@/lib/referral-site/api"
import { normalizeCode } from "@/lib/referral-site/code"
import { demoEligibility, type SignupDemo } from "@/lib/referral-site/demo"
import { checkInviteCode, type InviteCodeCheck } from "@/lib/referral-site/invite-code"
import { lookupCode } from "@/lib/referral-site/mock-api"
import type { EligibilityStatus } from "@/lib/referral-site/types"

const CODE_CHECK_DELAY_MS = 350

export type CodeStatus = InviteCodeCheck | { status: "empty" } | { status: "checking" }

export function useInviteCheck(
  code: string,
  viewer: { address: string | null; code: string },
  demo: boolean,
): CodeStatus {
  const normalized = normalizeCode(code)
  const debounced = useDebouncedValue(normalized, CODE_CHECK_DELAY_MS)
  const settled = debounced === normalized
  const query = useQuery({
    queryKey: ["site", "invite-check", debounced, viewer.address, viewer.code, demo],
    queryFn: () => checkInviteCode(debounced, viewer, demo ? async (value) => lookupCode(value) : undefined),
    enabled: settled && debounced.length > 0,
    retry: false,
    staleTime: 60_000,
  })
  if (!normalized) return { status: "empty" }
  if (!settled || !query.data) return { status: "checking" }
  return query.data
}

export function useEligibility(
  address: string | null,
  demo: SignupDemo | null,
): { status: EligibilityStatus | null; pending: boolean } {
  const query = useQuery({
    queryKey: ["site", "eligibility", address],
    queryFn: () => fetchEligibility(address ?? ""),
    enabled: !demo && address !== null,
    retry: false,
  })
  if (!address) return { status: null, pending: false }
  if (demo) return { status: demoEligibility(demo), pending: false }
  return { status: query.data?.status ?? null, pending: query.isPending }
}
