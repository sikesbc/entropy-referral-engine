"use client"

import { useState } from "react"
import { useLoginModal } from "@/components/auth/login-modal-context"
import { useDepositModal } from "@/components/deposit/deposit-modal-context"
import { Skeleton } from "@/components/ui/skeleton"
import { useGeoStatus } from "@/lib/api/account"
import { useClearinghouseState } from "@/lib/api/hyperliquid"
import { usePlaceOrder } from "@/lib/api/orders"
import { POLL } from "@/lib/api/polling"
import type { OrderSide, OrderType } from "@/lib/api/types/orders"
import { useSession } from "@/lib/auth/auth-context"
import { formatMarketPrice, marketPriceDecimals } from "@/lib/format/price"
import { usePollingInterval } from "@/lib/runtime/runtime-context"
import { useMarketSnapshot } from "@/lib/trade/market-snapshot"
import { AmountField } from "./amount-field"
import { LeverageSlider } from "./leverage-slider"
import { LimitPriceField } from "./limit-price-field"
import { MultiplierField } from "./multiplier-field"
import { OrderTicketHeader } from "./order-ticket-header"
import { OrderTypeMenu } from "./order-type-menu"
import { ProjectionPreview } from "./projection-preview"
import { SideToggle } from "./side-toggle"
import { TicketAction } from "./ticket-action"
import { liquidationPrice, parseDecimal, projectedProfit } from "./ticket-math"
import { TpSlSection } from "./tpsl-section"

const MIN_ORDER_NOTIONAL_USD = 10

type TicketActionState = { label: string; onClick: (() => void) | null }

export function OrderTicket({ coin }: { coin: string }) {
  const market = useMarketSnapshot(coin)
  const { isSignedIn, user } = useSession()
  const { openLogin } = useLoginModal()
  const { openDeposit } = useDepositModal()
  const geo = useGeoStatus()
  const accountInterval = usePollingInterval(POLL.account)
  const clearinghouse = useClearinghouseState(isSignedIn ? (user?.walletAddress ?? "") : "", market.dex, {
    refetchInterval: accountInterval,
  })
  const placeOrder = usePlaceOrder()

  const [orderType, setOrderType] = useState<OrderType>("market")
  const [side, setSide] = useState<OrderSide>("long")
  const [amount, setAmount] = useState("")
  const [leverageChoice, setLeverageChoice] = useState<number | null>(null)
  const [limitPrice, setLimitPrice] = useState("")
  const [tpslEnabled, setTpslEnabled] = useState(false)
  const [tpPrice, setTpPrice] = useState("")
  const [slPrice, setSlPrice] = useState("")
  const [movePreset, setMovePreset] = useState<number | null>(10)
  const [customMove, setCustomMove] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const maxLeverage = market.maxLeverage
  const leverage = maxLeverage === null ? 1 : Math.min(maxLeverage, leverageChoice ?? maxLeverage)
  const available = isSignedIn && clearinghouse.data ? Number(clearinghouse.data.withdrawable) : null
  const marginUsd = parseDecimal(amount)
  const notionalUsd = marginUsd * leverage
  const limitPx = parseDecimal(limitPrice)
  const entry = orderType === "limit" && limitPx > 0 ? limitPx : market.markPx
  const movePercent = movePreset ?? parseDecimal(customMove)
  const profit = projectedProfit(notionalUsd, movePercent, side)
  const autoClose =
    marginUsd > 0 && entry !== null && maxLeverage !== null
      ? formatMarketPrice(liquidationPrice(entry, leverage, maxLeverage, side), market.szDecimals)
      : "—"

  const submit = () => {
    setStatus(null)
    placeOrder.mutate(
      {
        coin,
        side,
        orderType,
        marginUsd,
        leverage,
        limitPx: orderType === "limit" ? limitPx : null,
        tpPx: tpslEnabled && parseDecimal(tpPrice) > 0 ? parseDecimal(tpPrice) : null,
        slPx: tpslEnabled && parseDecimal(slPrice) > 0 ? parseDecimal(slPrice) : null,
      },
      {
        onSuccess: ({ order }) => {
          setAmount("")
          setStatus(order.status === "resting" ? "Limit order placed." : "Order filled.")
        },
        onError: (error) => setStatus(error instanceof Error ? error.message : "Could not place order"),
      },
    )
  }

  const validationLabel = (): string | null => {
    if (marginUsd <= 0) return "Enter an amount"
    if (orderType === "limit" && limitPx <= 0) return "Limit price must be non-zero."
    if (available !== null && marginUsd > available) return "Not Enough Margin"
    if (notionalUsd < MIN_ORDER_NOTIONAL_USD) return `Minimum order is $${MIN_ORDER_NOTIONAL_USD}`
    return null
  }

  const action = ((): TicketActionState => {
    if (geo.data?.restricted) return { label: "Unavailable in your region", onClick: null }
    if (!isSignedIn) return { label: "Login", onClick: () => openLogin() }
    if (placeOrder.isPending) return { label: "Submitting order…", onClick: null }
    if (available !== null && available <= 0) return { label: "Deposit to trade", onClick: openDeposit }
    const invalid = validationLabel()
    return invalid ? { label: invalid, onClick: null } : { label: "Review order", onClick: submit }
  })()

  const useMid = () => {
    const mid = market.ctx?.midPx ? Number(market.ctx.midPx) : market.markPx
    if (!mid) return
    setLimitPrice(mid.toFixed(marketPriceDecimals(mid, market.szDecimals)))
  }

  return (
    <section
      aria-label="Order ticket"
      data-trade-order-panel="true"
      className="entropy-card flex flex-col gap-3 rounded-[0.625rem] p-3"
    >
      <OrderTicketHeader coin={coin} name={market.name}>
        <OrderTypeMenu value={orderType} onChange={setOrderType} />
      </OrderTicketHeader>
      <SideToggle side={side} onChange={setSide} />
      <AmountField amount={amount} available={available} onChange={setAmount} />
      <MultiplierField
        marketName={market.name}
        leverage={leverage}
        maxLeverage={maxLeverage}
        suppressHint={isSignedIn}
      >
        {maxLeverage === null ? (
          <div className="-mb-[0.1rem]">
            <div className="pb-5">
              <Skeleton className="h-[2.625rem] w-full rounded-[0.75rem]" />
            </div>
          </div>
        ) : (
          <LeverageSlider
            leverage={leverage}
            maxLeverage={maxLeverage}
            side={side}
            onChange={setLeverageChoice}
          />
        )}
      </MultiplierField>
      {orderType === "limit" ? (
        <LimitPriceField value={limitPrice} onChange={setLimitPrice} onUseMid={useMid} />
      ) : null}
      <TpSlSection
        enabled={tpslEnabled}
        onEnabledChange={(enabled) => {
          setTpslEnabled(enabled)
          if (enabled) return
          setTpPrice("")
          setSlPrice("")
        }}
        tpPrice={tpPrice}
        slPrice={slPrice}
        onTpPriceChange={setTpPrice}
        onSlPriceChange={setSlPrice}
        entry={entry}
        leverage={leverage}
        side={side}
        marginUsd={marginUsd}
      />
      <ProjectionPreview
        side={side}
        movePercent={movePercent}
        profit={profit}
        preset={movePreset}
        custom={customMove}
        onPresetChange={(preset) => {
          setMovePreset(preset)
          setCustomMove("")
        }}
        onCustomChange={(custom) => {
          setCustomMove(custom)
          setMovePreset(custom ? null : 10)
        }}
        autoClose={autoClose}
      />
      <TicketAction label={action.label} onClick={action.onClick} />
      {status ? (
        <p role="status" className="text-center text-[0.75rem] text-ink-quiet">
          {status}
        </p>
      ) : null}
    </section>
  )
}
