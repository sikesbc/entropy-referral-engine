import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const outbox: Record<string, unknown>[][] = []

vi.mock("@/backend/db/client", () => {
  const sql = (first: unknown) => {
    if (Array.isArray(first) && "raw" in first) return Promise.resolve([])
    outbox.push(first as Record<string, unknown>[])
    return first
  }
  return { db: () => sql }
})

const { RESEND_BATCH_LIMIT, sendEmails } = await import("./send")

function message(index: number) {
  return {
    address: `0x${index}`,
    to: `user${index}@example.com`,
    kind: "boost",
    email: { subject: `subject ${index}`, html: "<p>hi</p>", text: "hi" },
    unsubscribeUrl: `https://example.com/u/${index}`,
  }
}

describe("sendEmails", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    outbox.length = 0
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "info").mockImplementation(() => undefined)
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("records every message in one outbox insert when no API key is set", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    const results = await sendEmails([message(1), message(2)])
    expect(results).toEqual([{ status: "recorded" }, { status: "recorded" }])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(outbox).toHaveLength(1)
    expect(outbox[0].map((row) => row.status)).toEqual(["recorded", "recorded"])
  })

  it("posts to the batch endpoint in groups of at most 100", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test")
    fetchMock.mockImplementation(async (_url: string, init: { body: string }) => {
      const sent = JSON.parse(init.body) as unknown[]
      return Response.json({ data: sent.map((_, index) => ({ id: `id-${index}` })) })
    })
    const messages = Array.from({ length: RESEND_BATCH_LIMIT + 5 }, (_, index) => message(index))
    const results = await sendEmails(messages)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "https://api.resend.com/emails/batch",
      "https://api.resend.com/emails/batch",
    ])
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(RESEND_BATCH_LIMIT)
    expect(results.every((result) => result.status === "sent")).toBe(true)
    expect(outbox[0]).toHaveLength(RESEND_BATCH_LIMIT + 5)
    expect(outbox[0][RESEND_BATCH_LIMIT + 1]).toMatchObject({ status: "sent", provider_id: "id-1" })
  })

  it("marks a rejected batch as failed for every message", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test")
    fetchMock.mockResolvedValue(Response.json({ message: "invalid" }, { status: 422 }))
    const results = await sendEmails([message(1), message(2)])
    expect(results).toEqual([
      { status: "failed", error: "422 invalid" },
      { status: "failed", error: "422 invalid" },
    ])
    expect(outbox[0].map((row) => row.error)).toEqual(["422 invalid", "422 invalid"])
  })

  it("sends a single message through the single-email endpoint", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test")
    fetchMock.mockResolvedValue(Response.json({ id: "only" }))
    expect(await sendEmails([message(1)])).toEqual([{ status: "sent" }])
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.resend.com/emails")
    expect(outbox[0][0]).toMatchObject({ provider_id: "only" })
  })
})
