"use client"

import { CHANGE_PERIOD_LABEL } from "@/lib/trade/chart-ranges"
import { ChartToolbar } from "./chart/chart-toolbar"
import { PriceChart } from "./chart/price-chart"
import { MarketHeader } from "./market/market-header"
import { useMarketChart } from "./use-market-chart"

export function MarketPanel({ coin }: { coin: string }) {
  const chart = useMarketChart(coin)

  return (
    <section
      aria-label="Market"
      className="entropy-card rounded-[0.625rem] flex min-w-0 flex-col max-lg:order-1 lg:min-h-[var(--top-row)] lg:shrink-0"
    >
      <MarketHeader
        coin={coin}
        market={chart.market}
        markets={chart.rankedMarkets}
        price={chart.price}
        decimals={chart.decimals}
        change={chart.change}
        periodLabel={CHANGE_PERIOD_LABEL[chart.range]}
      />
      <div className="h-[26.25rem] md:h-[35rem] lg:h-auto lg:min-h-[10rem] lg:flex-1">
        <div className="flex h-full min-h-0 flex-col">
          <PriceChart
            series={chart.series}
            decimals={chart.decimals}
            tone={chart.change !== null && chart.change < 0 ? "down" : "up"}
            chartType={chart.chartType}
            range={chart.range}
            intervalMs={chart.intervalMs}
          />
          <ChartToolbar
            range={chart.range}
            interval={chart.interval}
            chartType={chart.chartType}
            onRangeChange={chart.changeRange}
            onIntervalChange={chart.changeInterval}
            onChartTypeChange={chart.setChartType}
          />
        </div>
      </div>
    </section>
  )
}
