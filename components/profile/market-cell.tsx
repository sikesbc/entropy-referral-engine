import { TABLE_CELL_CLASS } from "./profile-styles"
import { marketLogoSrc } from "@/lib/assets"
import { marketSymbol } from "@/lib/profile/format"
import { cn } from "@/lib/utils"

export function MarketCell({
  coin,
  isLong,
  leverage,
  detail,
}: {
  coin: string
  isLong: boolean
  leverage: number | null
  detail: string
}) {
  return (
    <td className={TABLE_CELL_CLASS}>
      <div className="flex items-center gap-3">
        <img src={marketLogoSrc(coin)} alt="" className="h-9 w-9 shrink-0 rounded-[0.5rem]" />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2 font-sans text-[0.9375rem] font-medium text-ink">
            {marketSymbol(coin)}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.75rem]",
                isLong ? "bg-up-bg text-up" : "bg-down-bg text-down",
              )}
            >
              {isLong ? "Long" : "Short"}
              {leverage ? ` ${leverage}x` : ""}
            </span>
          </div>
          <small className="font-sans text-[0.8125rem] text-ink-quiet">{detail}</small>
        </div>
      </div>
    </td>
  )
}
