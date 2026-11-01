"use client"

import { useEffect, useRef } from "react"
import {
  CANDLE_COLUMN_SPACING,
  RIPPLE_DURATION_MS,
  candleColumns,
  hexToRgb,
  morphProgress,
  pointerInfluence,
  rippleInfluence,
  type Point,
  type Ripple,
} from "./candle-field-model"

const LINE_COLOR = "#444"
const BAR_COLOR = "#5E5D59"
const LINE_WIDTH = 1
const PHASE_STEP = 0.005
const FROM_SEED = 0
const TO_SEED = 5
const OFFSCREEN: Point = { x: -9999, y: -9999 }

function animationsEnabled(): boolean {
  return document.documentElement.dataset.animations !== "off"
}

export function CandleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const animated = animationsEnabled()
    const pointer: Point = { ...OFFSCREEN }
    let ripples: Ripple[] = []
    let phase = 0
    let frame: number | null = null
    const [red, green, blue] = hexToRgb(BAR_COLOR)

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (width === 0 || height === 0) return
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = () => {
      const context = canvas.getContext("2d")
      if (!context) return
      const now = Date.now()
      phase += PHASE_STEP
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const count = Math.max(1, Math.floor(width / CANDLE_COLUMN_SPACING))
      const spacing = width / count
      const from = candleColumns(FROM_SEED, width, height, count)
      const to = candleColumns(TO_SEED, width, height, count)
      const progress = morphProgress(
        (phase % (Math.PI * 2)) + pointerInfluence(pointer, width / 2, height / 2) * 0.5,
      )
      context.clearRect(0, 0, width, height)
      for (let column = 0; column < count; column++) {
        const x = column * spacing + spacing / 2
        context.beginPath()
        context.strokeStyle = LINE_COLOR
        context.lineWidth = LINE_WIDTH + pointerInfluence(pointer, x, height / 2) * 2
        context.moveTo(x, 0)
        context.lineTo(x, height)
        context.stroke()
        const start = from[column] ?? []
        const end = to[column] ?? []
        const candles = Math.max(start.length, end.length)
        for (let index = 0; index < candles; index++) {
          const target = end[index]
          const source = start[index] ?? { y: (target?.y ?? 0) - 100, height: 0, width: 0 }
          const destination = target ?? { y: source.y + 100, height: 0, width: 0 }
          const hover = pointerInfluence(pointer, x, source.y)
          const wave = rippleInfluence(ripples, x, source.y, now)
          const drift =
            Math.sin(column * 0.3 + index * 0.5 + phase * 2) * 10 * (progress * (1 - progress) * 4) +
            hover * Math.sin(phase * 3 + column * 0.2) * 15 +
            wave * Math.sin(phase * 4 + index * 0.3) * 20
          const y = source.y + (destination.y - source.y) * progress + drift
          const barHeight =
            source.height + (destination.height - source.height) * progress + hover * 5 + wave * 8
          const barWidth = source.width + (destination.width - source.width) * progress + hover * 2 + wave * 3
          if (barHeight <= 0.1 || barWidth <= 0.1) continue
          context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${Math.min(1, 0.8 + hover * 0.2 + wave * 0.3)})`
          context.fillRect(x - barWidth / 2, y - barHeight / 2, barWidth, barHeight)
        }
      }
      frame = animated ? requestAnimationFrame(draw) : null
    }

    const track = (event: MouseEvent) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
    }

    const ripple = (event: MouseEvent) => {
      const bounds = canvas.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return
      const now = Date.now()
      ripples = [...ripples, { x, y, time: now, intensity: 2 }].filter(
        (item) => now - item.time < RIPPLE_DURATION_MS,
      )
    }

    resize()
    const observer = new ResizeObserver(() => {
      resize()
      if (!animated) draw()
    })
    observer.observe(parent)
    window.addEventListener("resize", resize)
    if (animated) {
      document.addEventListener("mousemove", track)
      document.addEventListener("mousedown", ripple)
    }
    draw()
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("mousemove", track)
      document.removeEventListener("mousedown", ripple)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="block h-full w-full" />
}
