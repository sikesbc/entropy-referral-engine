export type OrderSide = "long" | "short"

export type OrderType = "market" | "limit"

export type PlaceOrderRequest = {
  coin: string
  side: OrderSide
  orderType: OrderType
  marginUsd: number
  leverage: number
  limitPx: number | null
  tpPx: number | null
  slPx: number | null
}

export type PlacedOrder = {
  orderId: number
  coin: string
  side: OrderSide
  orderType: OrderType
  status: "filled" | "resting"
  marginUsd: number
  leverage: number
  notionalUsd: number
  limitPx: number | null
  tpPx: number | null
  slPx: number | null
  createdAt: number
}

export type PlaceOrderResponse = {
  status: "ok"
  order: PlacedOrder
}

export type OpenOrdersResponse = PlacedOrder[]
