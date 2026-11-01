"use client"

import { useLayoutEffect, useRef } from "react"
import { humane } from "./humane-font"

const LETTER_DELAY_START = 0.1
const LETTER_DELAY_STEP = 0.035
const LETTER_DURATION_MS = 620
const LETTER_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"

function shouldAnimate(): boolean {
  if (document.documentElement.dataset.animations === "off") return false
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function OnboardingTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const words = text.split(" ")

  useLayoutEffect(() => {
    const heading = ref.current
    if (!heading || !shouldAnimate()) return
    const letters = heading.querySelectorAll<HTMLElement>("[data-letter]")
    const animations = Array.from(letters, (letter, index) =>
      letter.animate([{ transform: "translateY(170%)" }, { transform: "none" }], {
        delay: (LETTER_DELAY_START + index * LETTER_DELAY_STEP) * 1000,
        duration: LETTER_DURATION_MS,
        easing: LETTER_EASING,
        fill: "backwards",
      }),
    )
    return () => animations.forEach((animation) => animation.cancel())
  }, [])

  return (
    <h1
      ref={ref}
      className="text-[76px] font-bold leading-[0.82] tracking-normal sm:text-[120px]"
      aria-label={text}
      style={{ fontFamily: humane.style.fontFamily }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} aria-hidden="true">
          <span className="inline-block whitespace-nowrap">
            {Array.from(word, (letter, letterIndex) => (
              <span
                key={letterIndex}
                className="inline-block overflow-hidden py-[0.14em] -my-[0.14em] align-bottom"
              >
                <span data-letter="" className="inline-block">
                  {letter}
                </span>
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  )
}
