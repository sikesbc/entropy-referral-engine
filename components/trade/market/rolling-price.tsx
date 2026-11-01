"use client"

import { useLayoutEffect, useRef } from "react"
import { formatMarketPrice, splitPrice } from "@/lib/trade/price"

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

function RollDigit({ digit }: { digit: number }) {
  return (
    <span className="lite-roll-digit">
      <span className="lite-roll-strip" style={{ transform: `translateY(-${digit * 10}%)` }}>
        {DIGITS.map((glyph) => (
          <i key={glyph}>{glyph}</i>
        ))}
      </span>
    </span>
  )
}

function RollGlyphs({ text }: { text: string }) {
  return [...text].map((glyph, index) => {
    const key = text.length - index
    return /\d/.test(glyph) ? (
      <RollDigit key={key} digit={Number(glyph)} />
    ) : (
      <span key={key} className="lite-roll-char">
        {glyph}
      </span>
    )
  })
}

export function RollingPrice({ value, decimals }: { value: number; decimals: number }) {
  const wholeRef = useRef<HTMLSpanElement>(null)
  const { whole, fraction } = splitPrice(value, decimals)

  useLayoutEffect(() => {
    const container = wholeRef.current
    if (!container) return
    for (const child of Array.from(container.children)) {
      if (child instanceof HTMLElement) {
        child.style.setProperty("--sx", `${Math.round(child.getBoundingClientRect().left)}px`)
      }
    }
  }, [whole])

  return (
    <span className="lite-price lite-price-sheen">
      <span className="sr-only">{formatMarketPrice(value, decimals)}</span>
      <span ref={wholeRef} className="lite-price-whole" aria-hidden="true">
        <span className="lite-roll-char">$</span>
        <RollGlyphs text={whole} />
      </span>
      {fraction ? (
        <span className="lite-price-fraction" aria-hidden="true">
          <span className="lite-roll-char">.</span>
          <RollGlyphs text={fraction} />
        </span>
      ) : null}
    </span>
  )
}
