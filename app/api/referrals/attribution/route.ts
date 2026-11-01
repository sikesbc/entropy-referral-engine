import { NextResponse, type NextRequest } from "next/server"
import type {
  ApplyReferralCodeRejection,
  ApplyReferralCodeResponse,
  ApplyReferralCodeResult,
  ReferralEarningsResponse,
} from "@/lib/api/types/referrals"
import { sessionSideFrom } from "@/lib/auth/server"
import { captureTime, findHttpFixture } from "@/lib/mock/fixtures"
import { isDeterministic } from "@/lib/runtime/env"

export { serveFixture as GET } from "@/lib/mock/handlers"

const CODE_PATTERN = /^[a-z0-9_-]{1,32}$/

const REJECTION_MESSAGES: Record<ApplyReferralCodeRejection, string> = {
  invalid_code: "Referral codes use letters, numbers, dashes and underscores.",
  unknown_code: "That referral code doesn’t exist.",
  self_referral: "You can’t use your own referral code.",
  already_attributed: "Your account already has a referrer.",
}

function reject(reason: ApplyReferralCodeRejection): ApplyReferralCodeResult {
  return { status: "rejected", reason, message: REJECTION_MESSAGES[reason] }
}

function readCode(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null
  const code = (body as { code?: unknown }).code
  return typeof code === "string" ? code.trim().toLowerCase() : null
}

async function ownReferralSlug(): Promise<string | null> {
  const record = await findHttpFixture("loggedin", "GET", "/api/referrals/earnings", new URLSearchParams())
  return record ? (record.response as ReferralEarningsResponse).data.partner.slug : null
}

async function attachedAt(): Promise<string> {
  return new Date(isDeterministic() ? await captureTime("loggedin") : Date.now()).toISOString()
}

async function resolve(code: string): Promise<ApplyReferralCodeResult> {
  if (!CODE_PATTERN.test(code)) return reject("invalid_code")
  if (code === (await ownReferralSlug())) return reject("self_referral")
  return {
    status: "attached",
    attribution: {
      sourceSlug: code,
      partner: { slug: code, displayName: null },
      attachedAt: await attachedAt(),
    },
  }
}

export async function POST(request: NextRequest) {
  if (sessionSideFrom(request.cookies) === "loggedout") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const code = readCode(await request.json().catch(() => null))
  if (code === null) return NextResponse.json({ error: "Missing referral code" }, { status: 400 })
  const response: ApplyReferralCodeResponse = { success: true, data: await resolve(code) }
  return NextResponse.json(response)
}
