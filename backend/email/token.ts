import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

function secret(): string | null {
  return process.env.EMAIL_SIGNING_SECRET || process.env.CRON_SECRET || null
}

function sign(address: string, key: string): string {
  return createHmac("sha256", key).update(`unsubscribe:${address}`).digest("base64url")
}

export function unsubscribeToken(address: string): string {
  const key = secret()
  return `${address}.${key ? sign(address, key) : "unsigned"}`
}

export function verifyUnsubscribeToken(token: string): string | null {
  const key = secret()
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [address, signature] = parts
  if (!key || !address || !signature || !/^0x[0-9a-f]{40}$/.test(address)) return null
  const expected = Buffer.from(sign(address, key))
  const received = Buffer.from(signature)
  return expected.length === received.length && timingSafeEqual(expected, received) ? address : null
}
