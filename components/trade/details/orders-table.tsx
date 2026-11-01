"use client"

import { useCancelOrder } from "@/lib/api/orders"
import type { PlacedOrder } from "@/lib/api/types/orders"
import { formatMarketPrice } from "@/lib/format/price"
import { cn } from "@/lib/utils"
import { SECONDARY_BUTTON } from "./activity-cells"
import type { MarketDirectory } from "./market-directory"

const COLUMNS = ["Market", "Side / type", "Remaining", "Price / trigger", "Reserved", ""]

export function OrdersTable({ orders, markets }: { orders: PlacedOrder[]; markets: MarketDirectory }) {
  const cancel = useCancelOrder()
  return (
    <table className="w-full whitespace-nowrap text-left text-[0.75rem]">
      <thead className="text-ink-quiet">
        <tr>
          {COLUMNS.map((column, index) => (
            <th key={index} className="relative px-2 py-3 font-normal first:pl-0">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const info = markets.lookup(order.coin)
          const price = order.limitPx
          const size = price ? order.notionalUsd / price : null
          const cancelling = cancel.isPending && cancel.variables === order.orderId
          return (
            <tr
              key={order.orderId}
              className="border-t border-line-soft font-mono transition-colors hover:bg-ink/[0.03]"
            >
              <td className="py-3">{info.ticker}</td>
              <td className={cn("px-2", order.side === "long" ? "text-up" : "text-down")}>
                {order.side === "long" ? "buy" : "sell"} · {order.orderType === "limit" ? "Limit" : "Market"}
              </td>
              <td className="px-2">{size === null ? "—" : size.toFixed(info.szDecimals)}</td>
              <td className="px-2">{price === null ? "—" : formatMarketPrice(price, info.szDecimals)}</td>
              <td className="px-2" title="Per-order reserved collateral is not provided by the venue">
                —
              </td>
              <td className="space-x-2 text-right">
                <button
                  type="button"
                  className={SECONDARY_BUTTON}
                  disabled={cancelling}
                  onClick={() => cancel.mutate(order.orderId)}
                >
                  {cancelling ? "Cancelling…" : "Cancel"}
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
