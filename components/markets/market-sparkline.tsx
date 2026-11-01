"use client"

import { useEffect, useRef, useState } from "react"
import { SparklineChart } from "./sparkline-chart"

type Size = { width: number; height: number }

export function MarketSparkline({
  coin,
  up,
  price,
  className,
}: {
  coin: string
  up: boolean
  price: number | null
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {size && size.width > 0 && size.height > 0 ? (
        <SparklineChart coin={coin} up={up} endPrice={price} width={size.width} height={size.height} />
      ) : null}
    </div>
  )
}
