import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

const ASSETS = path.join(process.cwd(), "assets/og")
const FONTS = path.join(process.cwd(), "app/fonts")

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function candleColumns() {
  const random = seeded(7)
  return Array.from({ length: 34 }, (_, column) => {
    const candles = Array.from({ length: 7 }, () => ({
      top: Math.floor(random() * 560),
      height: 18 + Math.floor(random() * 46),
      wick: 10 + Math.floor(random() * 30),
    }))
    return { left: 14 + column * 15.5, candles }
  })
}

const COLUMNS = candleColumns()

async function readAssets() {
  const [humane, ciburial, mono, mark] = await Promise.all([
    readFile(path.join(ASSETS, "Humane-Bold.ttf")),
    readFile(path.join(FONTS, "EntropyCiburial-Regular.ttf")),
    readFile(path.join(FONTS, "EntropyMono-Regular.ttf")),
    readFile(path.join(ASSETS, "io-mark.svg"), "utf8"),
  ])
  return { humane, ciburial, mono, mark: `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}` }
}

let assetsPromise: ReturnType<typeof readAssets> | null = null

function loadAssets() {
  assetsPromise ??= readAssets().catch((error) => {
    assetsPromise = null
    throw error
  })
  return assetsPromise
}

export async function renderInviteCard({
  headline,
  subline,
  footer,
}: {
  headline: string
  subline: string
  footer: string
}) {
  const assets = await loadAssets()
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b0b0b", color: "#f2f2f0" }}>
      <div
        style={{
          display: "flex",
          position: "relative",
          width: 540,
          height: "100%",
          borderRight: "1px solid #1f1f1f",
        }}
      >
        {COLUMNS.map((column, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              position: "absolute",
              left: column.left,
              top: 0,
              width: 1,
              height: "100%",
              background: "#1c1c1c",
            }}
          >
            {column.candles.map((candle, candleIndex) => (
              <div
                key={candleIndex}
                style={{
                  display: "flex",
                  position: "absolute",
                  left: -3,
                  top: candle.top,
                  width: 7,
                  height: candle.height,
                  background: "#4a4a48",
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: 540,
            height: 630,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", padding: 36, borderRadius: 28, background: "rgba(11,11,11,0.82)" }}>
            <img src={assets.mark} width={210} height={164} alt="" />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Humane",
              fontSize: 112,
              lineHeight: 0.86,
              letterSpacing: 0,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Ciburial",
              fontSize: 26,
              color: "#a3a3a0",
              lineHeight: 1.35,
            }}
          >
            {subline}
          </div>
        </div>
        <div style={{ display: "flex", fontFamily: "EntropyMono", fontSize: 22, color: "#7a7a77" }}>
          {footer}
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Humane", data: assets.humane, weight: 700, style: "normal" },
        { name: "Ciburial", data: assets.ciburial, weight: 400, style: "normal" },
        { name: "EntropyMono", data: assets.mono, weight: 400, style: "normal" },
      ],
    },
  )
}
