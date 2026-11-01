import "server-only"
import { db } from "@/backend/db/client"
import { chunk } from "./batch"
import type { RenderedEmail } from "./render"

export type SendResult = { status: "sent" | "recorded" | "failed"; error?: string }

export type Outgoing = {
  address: string | null
  to: string
  kind: string
  email: RenderedEmail
  unsubscribeUrl: string
}

type Delivered = { result: SendResult; providerId: string | null }

export const RESEND_BATCH_LIMIT = 100
const OUTBOX_CHUNK = 1000

function resendBody(message: Outgoing) {
  return {
    from: process.env.RESEND_FROM || "Entropy <onboarding@resend.dev>",
    to: [message.to],
    subject: message.email.subject,
    html: message.email.html,
    text: message.email.text,
    headers: {
      "List-Unsubscribe": `<${message.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  }
}

function failed(error: unknown): Delivered {
  return {
    result: { status: "failed", error: error instanceof Error ? error.message : String(error) },
    providerId: null,
  }
}

async function postToResend(
  key: string,
  path: string,
  body: unknown,
): Promise<{ body: unknown; error: string | null }> {
  const response = await fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  const parsed: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = (parsed as { message?: string } | null)?.message
    return { body: parsed, error: `${response.status} ${message ?? "resend error"}`.slice(0, 500) }
  }
  return { body: parsed, error: null }
}

async function deliverOne(key: string, message: Outgoing): Promise<Delivered> {
  try {
    const sent = await postToResend(key, "/emails", resendBody(message))
    if (sent.error) return { result: { status: "failed", error: sent.error }, providerId: null }
    return { result: { status: "sent" }, providerId: (sent.body as { id?: string } | null)?.id ?? null }
  } catch (error) {
    return failed(error)
  }
}

async function deliverBatch(key: string, messages: Outgoing[]): Promise<Delivered[]> {
  try {
    const sent = await postToResend(key, "/emails/batch", messages.map(resendBody))
    if (sent.error)
      return messages.map(() => ({
        result: { status: "failed", error: sent.error ?? undefined },
        providerId: null,
      }))
    const ids = (sent.body as { data?: { id?: string }[] } | null)?.data ?? []
    return messages.map((_, index) => ({ result: { status: "sent" }, providerId: ids[index]?.id ?? null }))
  } catch (error) {
    return messages.map(() => failed(error))
  }
}

function recorded(message: Outgoing): Delivered {
  console.info(`[email] RESEND_API_KEY unset, recorded "${message.email.subject}" for ${message.to}`)
  return { result: { status: "recorded" }, providerId: null }
}

async function recordOutbox(messages: Outgoing[], delivered: Delivered[]): Promise<void> {
  const rows = messages.map((message, index) => ({
    address: message.address,
    to_email: message.to,
    kind: message.kind,
    subject: message.email.subject,
    html: message.email.html,
    text: message.email.text,
    status: delivered[index].result.status,
    provider_id: delivered[index].providerId,
    error: delivered[index].result.error ?? null,
  }))
  const sql = db()
  for (const rowChunk of chunk(rows, OUTBOX_CHUNK)) {
    await sql`insert into email_outbox ${sql(rowChunk)}`.catch((error: unknown) =>
      console.error("[email] outbox write failed", error),
    )
  }
  for (const { result } of delivered)
    if (result.status === "failed") console.error(`[email] send failed: ${result.error}`)
}

export async function sendEmail(message: Outgoing): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY
  const delivered = key ? await deliverOne(key, message) : recorded(message)
  await recordOutbox([message], [delivered])
  return delivered.result
}

export async function sendEmails(messages: Outgoing[]): Promise<SendResult[]> {
  if (messages.length === 0) return []
  const key = process.env.RESEND_API_KEY
  const delivered: Delivered[] = []
  if (key) {
    for (const batch of chunk(messages, RESEND_BATCH_LIMIT)) {
      delivered.push(
        ...(batch.length === 1 ? [await deliverOne(key, batch[0])] : await deliverBatch(key, batch)),
      )
    }
  } else {
    delivered.push(...messages.map(recorded))
  }
  await recordOutbox(messages, delivered)
  return delivered.map((item) => item.result)
}
