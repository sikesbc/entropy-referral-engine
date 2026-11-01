"use client"

import { useState } from "react"
import type { OrderSide } from "@/lib/api/types/orders"
import { parseDecimal, priceForReturn, returnForPrice } from "./ticket-math"
import { TpSlInput, type ValueUnit } from "./tpsl-input"

type TpSlBracketProps = {
  kind: "tp" | "sl"
  price: string
  onPriceChange: (price: string) => void
  entry: number | null
  leverage: number
  side: OrderSide
  marginUsd: number
}

function trimNumber(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return ""
  return String(Number(value.toFixed(decimals)))
}

export function TpSlBracket({
  kind,
  price,
  onPriceChange,
  entry,
  leverage,
  side,
  marginUsd,
}: TpSlBracketProps) {
  const [unit, setUnit] = useState<ValueUnit>("percent")
  const [draft, setDraft] = useState<string | null>(null)
  const direction = kind === "tp" ? 1 : -1

  const derived = (() => {
    const target = parseDecimal(price)
    if (!entry || target <= 0) return ""
    const returnPercent = returnForPrice(entry, target, leverage, side) * direction
    return unit === "percent"
      ? trimNumber(returnPercent, 2)
      : trimNumber((marginUsd * returnPercent) / 100, 2)
  })()

  const handleReturnChange = (next: string) => {
    setDraft(next)
    const amount = parseDecimal(next)
    if (!entry || amount <= 0) {
      onPriceChange("")
      return
    }
    const returnPercent = unit === "percent" ? amount : marginUsd > 0 ? (amount / marginUsd) * 100 : 0
    const target = priceForReturn(entry, returnPercent * direction, leverage, side)
    onPriceChange(target > 0 ? trimNumber(target, 6) : "")
  }

  return (
    <>
      <TpSlInput label={kind === "tp" ? "TP Price" : "SL Price"} value={price} onChange={onPriceChange} />
      <TpSlInput
        label={kind === "tp" ? "Gain" : "Loss"}
        value={draft ?? derived}
        onChange={handleReturnChange}
        onBlur={() => setDraft(null)}
        unit={unit}
        onToggleUnit={() => {
          setDraft(null)
          setUnit((current) => (current === "percent" ? "usd" : "percent"))
        }}
      />
    </>
  )
}
