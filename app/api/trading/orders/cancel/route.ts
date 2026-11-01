import { NextResponse, type NextRequest } from "next/server"
import { sessionSideFrom } from "@/lib/auth/server"

export async function POST(request: NextRequest) {
  if (sessionSideFrom(request.cookies) !== "loggedin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body: unknown = await request.json().catch(() => null)
  const orderId =
    typeof body === "object" && body !== null ? (body as { orderId?: unknown }).orderId : undefined
  if (typeof orderId !== "number" || !Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 })
  }
  return NextResponse.json({ status: "ok", orderId })
}
