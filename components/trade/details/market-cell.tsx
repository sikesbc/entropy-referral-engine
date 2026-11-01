import { marketLogoSrc } from "@/lib/assets"
import { cn } from "@/lib/utils"
import { BODY_CELL, DETAIL } from "./activity-cells"

type MarketCellProps = {
  coin: string
  name: string
  isLong: boolean
  leverage: number | null
  detail: string
}

export function MarketCell({ coin, name, isLong, leverage, detail }: MarketCellProps) {
  return (
    <td className={BODY_CELL}>
      <div className="flex items-center gap-3">
        <img
          alt=""
          decoding="async"
          src={marketLogoSrc(coin)}
          className="h-8 w-8 shrink-0 rounded-[0.375rem] object-contain"
        />
        <div className="min-w-0">
          <b className="block font-sans text-[0.9375rem] font-medium text-ink">{name}</b>
          <small className={DETAIL}>
            <span className={cn("font-medium", isLong ? "text-up" : "text-down")}>
              {isLong ? "Long" : "Short"}
              {leverage ? ` ${leverage}×` : ""}
            </span>
            {detail ? ` · ${detail}` : ""}
          </small>
        </div>
      </div>
    </td>
  )
}
