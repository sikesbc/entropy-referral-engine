"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/lib/auth/auth-context"
import { apiGet, apiPost } from "./client"
import type { OpenOrdersResponse, PlaceOrderRequest, PlaceOrderResponse } from "./types/orders"

export const ordersKeys = {
  all: ["orders"] as const,
  open: () => [...ordersKeys.all, "open"] as const,
}

export const fetchOpenOrders = () => apiGet<OpenOrdersResponse>("/api/trading/orders")
export const placeOrder = (request: PlaceOrderRequest) =>
  apiPost<PlaceOrderResponse>("/api/trading/orders", request)

export const cancelOrder = (orderId: number) =>
  apiPost<{ status: "ok"; orderId: number }>("/api/trading/orders/cancel", { orderId })

export function useOpenOrders() {
  const { isSignedIn } = useSession()
  return useQuery({ queryKey: ordersKeys.open(), queryFn: fetchOpenOrders, enabled: isSignedIn })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: ({ order }) => {
      if (order.status !== "resting") return
      queryClient.setQueryData<OpenOrdersResponse>(ordersKeys.open(), (previous) => [
        ...(previous ?? []),
        order,
      ])
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: ({ orderId }) => {
      queryClient.setQueryData<OpenOrdersResponse>(ordersKeys.open(), (previous) =>
        (previous ?? []).filter((order) => order.orderId !== orderId),
      )
    },
  })
}
