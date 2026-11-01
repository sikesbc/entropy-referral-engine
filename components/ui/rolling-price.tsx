"use client"

import { useLayoutEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const DIGIT_STRIP = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

function RollingChars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((char, index) =>
        /\d/.test(char) ? (
          <span key={index} className="lite-roll-digit">
            <span className="lite-roll-strip" style={{ transform: `translateY(${-Number(char) * 10}%)` }}>
              {DIGIT_STRIP.map((digit) => (
                <i key={digit}>{digit}</i>
              ))}
            </span>
          </span>
        ) : (
          <span key={index} className="lite-roll-char">
            {char}
          </span>
        ),
      )}
    </>
  )
}

export function RollingPrice({ text, className }: { text: string; className?: string }) {
  const wholeRef = useRef<HTMLSpanElement>(null)
  const dot = text.lastIndexOf(".")
  const whole = dot < 0 ? text : text.slice(0, dot)
  const fraction = dot < 0 ? "" : text.slice(dot)

  useLayoutEffect(() => {
    for (const child of Array.from(wholeRef.current?.children ?? [])) {
      if (child instanceof HTMLElement) child.style.setProperty("--sx", `${child.offsetLeft}px`)
    }
  }, [whole])

  return (
    <span className={cn("lite-price lite-price-sheen", className)}>
      <span className="sr-only">{text}</span>
      <span ref={wholeRef} className="lite-price-whole" aria-hidden="true">
        <RollingChars text={whole} />
      </span>
      {fraction ? (
        <span className="lite-price-fraction" aria-hidden="true">
          <RollingChars text={fraction} />
        </span>
      ) : null}
    </span>
  )
}
