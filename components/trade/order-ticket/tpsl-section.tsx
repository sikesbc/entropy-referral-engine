"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { OrderSide } from "@/lib/api/types/orders"
import { cn } from "@/lib/utils"
import { TpSlBracket } from "./tpsl-bracket"

type TpSlSectionProps = {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  tpPrice: string
  slPrice: string
  onTpPriceChange: (price: string) => void
  onSlPriceChange: (price: string) => void
  entry: number | null
  leverage: number
  side: OrderSide
  marginUsd: number
}

export function TpSlSection({
  enabled,
  onEnabledChange,
  tpPrice,
  slPrice,
  onTpPriceChange,
  onSlPriceChange,
  entry,
  leverage,
  side,
  marginUsd,
}: TpSlSectionProps) {
  const shared = { entry, leverage, side, marginUsd }
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[0.8125rem] tracking-[-0.02em] cursor-pointer text-ink">
          <Checkbox checked={enabled} onCheckedChange={(checked) => onEnabledChange(checked)} />
          TP / SL
        </label>
      </div>
      <div
        aria-hidden={!enabled}
        inert={!enabled}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          enabled ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-2 pt-2">
            <TpSlBracket kind="tp" price={tpPrice} onPriceChange={onTpPriceChange} {...shared} />
            <TpSlBracket kind="sl" price={slPrice} onPriceChange={onSlPriceChange} {...shared} />
          </div>
        </div>
      </div>
    </div>
  )
}
