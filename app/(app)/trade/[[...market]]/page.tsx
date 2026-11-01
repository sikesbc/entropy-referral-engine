import { MarketDetails } from "@/components/trade/details/market-details"
import { MarketPanel } from "@/components/trade/market-panel"
import { OrderTicket } from "@/components/trade/order-ticket/order-ticket"
import { TradeLayout } from "@/components/trade/trade-layout"
import { coinFromSegments } from "@/lib/trade/markets"

export default async function TradePage({ params }: PageProps<"/trade/[[...market]]">) {
  const { market } = await params
  const coin = coinFromSegments(market)

  return (
    <TradeLayout
      market={<MarketPanel coin={coin} />}
      details={<MarketDetails coin={coin} />}
      ticket={<OrderTicket coin={coin} />}
    />
  )
}
