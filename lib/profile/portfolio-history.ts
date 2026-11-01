import type { Portfolio, PortfolioHistory, PortfolioWindow } from "@/lib/api/types/hyperliquid"

const DAY_MS = 86_400_000

export type PortfolioRange = "1d" | "1w" | "1m" | "3m" | "1y" | "all"

export type PortfolioRangeOption = {
  range: PortfolioRange
  label: string
  changeLabel: string
  window: PortfolioWindow
  lookback: number | null
}

export const PORTFOLIO_RANGES: readonly PortfolioRangeOption[] = [
  { range: "1d", label: "1D", changeLabel: "Today", window: "day", lookback: null },
  { range: "1w", label: "1W", changeLabel: "Past week", window: "week", lookback: null },
  { range: "1m", label: "1M", changeLabel: "Past month", window: "month", lookback: null },
  { range: "3m", label: "3M", changeLabel: "Past 3 months", window: "allTime", lookback: 90 * DAY_MS },
  { range: "1y", label: "1Y", changeLabel: "Past year", window: "allTime", lookback: 365 * DAY_MS },
  { range: "all", label: "ALL", changeLabel: "All time", window: "allTime", lookback: null },
]

export function portfolioRangeOption(range: PortfolioRange): PortfolioRangeOption {
  return PORTFOLIO_RANGES.find((option) => option.range === range) ?? PORTFOLIO_RANGES[0]
}

export type SeriesPoint = { t: number; value: number }

export type PortfolioChange = { usd: number; pct: number | null }

export type PortfolioWindowHistory = {
  balanceSeries: SeriesPoint[]
  pnlSeries: SeriesPoint[]
  change: PortfolioChange
}

function finite(value: string | number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toSeries(points: [number, string][]): SeriesPoint[] {
  return points.map(([t, value]) => ({ t, value: finite(value) }))
}

function changeFrom(end: number, start: number, flows: number): PortfolioChange {
  const base = start + flows
  const usd = end - base
  return { usd, pct: base > 0 ? (usd / base) * 100 : null }
}

export function transformPortfolioWindow(history: PortfolioHistory | undefined): PortfolioWindowHistory {
  const empty: PortfolioWindowHistory = { balanceSeries: [], pnlSeries: [], change: { usd: 0, pct: null } }
  if (!history || history.accountValueHistory.length === 0) return empty
  const balance = history.accountValueHistory
  const pnl = history.pnlHistory
  const first = finite(balance[0][1])
  const last = finite(balance[balance.length - 1][1])
  const balanceSeries = toSeries(balance)
  if (pnl.length === 0) return { ...empty, balanceSeries }
  const pnlStart = finite(pnl[0][1])
  const pnlEnd = finite(pnl[pnl.length - 1][1])
  const flows = last - first - (pnlEnd - pnlStart)
  return { balanceSeries, pnlSeries: toSeries(pnl), change: changeFrom(last, first, flows) }
}

export function portfolioWindow(portfolio: Portfolio | undefined, window: PortfolioWindow) {
  const entry = portfolio?.find(([key]) => key === window)
  return entry ? transformPortfolioWindow(entry[1]) : undefined
}

export function sliceHistory(history: PortfolioWindowHistory, since: number): PortfolioWindowHistory {
  const balanceSeries = history.balanceSeries.filter((point) => point.t >= since)
  const pnlSeries = history.pnlSeries.filter((point) => point.t >= since)
  if (balanceSeries.length === history.balanceSeries.length) return history
  const usd = (pnlSeries.at(-1)?.value ?? 0) - (pnlSeries[0]?.value ?? 0)
  const start = balanceSeries[0]?.value ?? 0
  const flows = (balanceSeries.at(-1)?.value ?? start) - start - usd
  const base = start + Math.max(0, flows)
  return { balanceSeries, pnlSeries, change: { usd, pct: base > 0 ? (usd / base) * 100 : null } }
}

export function historyForRange(
  portfolio: Portfolio | undefined,
  range: PortfolioRange,
  now: number,
): PortfolioWindowHistory | undefined {
  const option = portfolioRangeOption(range)
  const history = portfolioWindow(portfolio, option.window)
  if (!history || option.lookback === null) return history
  return sliceHistory(history, now - option.lookback)
}
