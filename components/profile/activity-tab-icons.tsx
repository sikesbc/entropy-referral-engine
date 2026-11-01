import { ClipboardList, Layers, RotateCcwClock } from "lucide-react"

export type ActivityTabValue = "positions" | "orders" | "history"

export const ACTIVITY_TAB_LABELS: Record<ActivityTabValue, string> = {
  positions: "Positions",
  orders: "Orders",
  history: "History",
}

export function ActivityTabIcon({ tab }: { tab: ActivityTabValue }) {
  if (tab === "positions") return <Layers aria-hidden="true" className="size-4" />
  if (tab === "orders") return <ClipboardList aria-hidden="true" className="size-4" />
  return <RotateCcwClock aria-hidden="true" className="size-4" />
}
