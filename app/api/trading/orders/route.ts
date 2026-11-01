import { NextResponse, type NextRequest } from "next/server"
import { sessionSideFrom } from "@/lib/auth/server"
import type { PlaceOrderRequest, PlaceOrderResponse } from "@/lib/api/types/orders"

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
}

function optionalPrice(value: unknown): number | null {
  return isPositiveNumber(value) ? value : null
}

function parseOrder(body: unknown): PlaceOrderRequest | null {
  if (typeof body !== "object" || body === null) return null
  const input = body as Record<string, unknown>
  if (typeof input.coin !== "string" || input.coin.length === 0) return null
  if (input.side !== "long" && input.side !== "short") return null
  if (input.orderType !== "market" && input.orderType !== "limit") return null
  if (!isPositiveNumber(input.marginUsd) || !isPositiveNumber(input.leverage)) return null
  const limitPx = optionalPrice(input.limitPx)
  if (input.orderType === "limit" && limitPx === null) return null
  return {
    coin: input.coin,
    side: input.side,
    orderType: input.orderType,
    marginUsd: input.marginUsd,
    leverage: input.leverage,
    limitPx,
    tpPx: optionalPrice(input.tpPx),
    slPx: optionalPrice(input.slPx),
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET(request: NextRequest) {
  if (sessionSideFrom(request.cookies) !== "loggedin") return unauthorized()
  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  if (sessionSideFrom(request.cookies) !== "loggedin") return unauthorized()
  const order = parseOrder(await request.json().catch(() => null))
  if (!order) return NextResponse.json({ error: "Invalid order" }, { status: 400 })
  const createdAt = Date.now()
  const response: PlaceOrderResponse = {
    status: "ok",
    order: {
      ...order,
      orderId: createdAt,
      status: order.orderType === "limit" ? "resting" : "filled",
      notionalUsd: order.marginUsd * order.leverage,
      createdAt,
    },
  }
  return NextResponse.json(response)
}
