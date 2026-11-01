import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { qrSvg } from "@/components/site/referrals/pass/qr"
import { REFERRER_SHARE } from "@/lib/referral-site/config"
import { formatPercent } from "@/lib/referral-site/format"
import type { DecimalString, ReferralMarketState } from "@/lib/referral-site/types"
import { OG_SIZE } from "./invite-card"
import type { MarketSkin } from "./market-skins"

const ASSETS = path.join(process.cwd(), "assets/og")
const FONTS = path.join(process.cwd(), "app/fonts")
const PUBLIC = path.join(process.cwd(), "public")

const PAGE = "#0b0b0b"
const INK = "#e9e9ec"
const QR_PAPER = "#141518"
const METAL = "linear-gradient(180deg, #25272d 0%, #17181c 52%, #0f1013 100%)"
const MARK_FILE = "hero-media/shader-mark-silver-og.png"
const MARK_ASPECT = 704 / 552
const MARK_HEIGHT_RATIO = 1
const MARK_LEFT_RATIO = 0.7
const MARK_BOTTOM_RATIO = 0.275
const MARGIN = 48
const TICKET_HEIGHT = OG_SIZE.height - MARGIN * 2
const STUB_WIDTH = 300
const BODY_PADDING = 56
const RADIUS = 28
const NOTCH = 20
const PERF_DOTS = 22
const MARKED_NAME_ROOM = 0.64

function dataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

function memo<T>(load: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | null = null
  return () => {
    pending ??= load().catch((error) => {
      pending = null
      throw error
    })
    return pending
  }
}

function memoBy<T>(load: (key: string) => Promise<T>): (key: string) => Promise<T> {
  const cache = new Map<string, Promise<T>>()
  return (key) => {
    let pending = cache.get(key)
    if (!pending) {
      pending = load(key).catch((error) => {
        cache.delete(key)
        throw error
      })
      cache.set(key, pending)
    }
    return pending
  }
}

const loadFonts = memo(async () => {
  const [humane, ciburial, mono] = await Promise.all([
    readFile(path.join(ASSETS, "Humane-Bold.ttf")),
    readFile(path.join(FONTS, "EntropyCiburial-Medium.ttf")),
    readFile(path.join(FONTS, "EntropyMono-Regular.ttf")),
  ])
  return { humane, ciburial, mono }
})

const loadLogoSvg = memo(() => readFile(path.join(PUBLIC, "entropy-logo-white.svg"), "utf8"))

const loadLogo = memoBy(async (ink) => dataUri((await loadLogoSvg()).replaceAll("#F2F1F0", ink)))

async function loadAssets(ink: string) {
  const [fonts, logo] = await Promise.all([loadFonts(), loadLogo(ink)])
  return { ...fonts, logo }
}

function memberLabel(memberNumber: number | undefined): string | null {
  if (memberNumber === undefined || !Number.isInteger(memberNumber) || memberNumber < 0) return null
  return `MEMBER #${String(memberNumber).padStart(4, "0")}`
}

function usernameSize(username: string, width: number): number {
  return Math.round(Math.min(260, width / Math.max(username.length * 0.24, 1)))
}

function Label({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "EntropyMono",
        fontSize: 16,
        letterSpacing: 4,
        textTransform: "uppercase",
        opacity: 0.62,
      }}
    >
      {children}
    </div>
  )
}

function Notch({ left, top }: { left: number; top: number }) {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        left: left - NOTCH,
        top: top - NOTCH,
        width: NOTCH * 2,
        height: NOTCH * 2,
        borderRadius: NOTCH,
        background: PAGE,
      }}
    />
  )
}

type TicketMarket = { skin: MarketSkin; rate: DecimalString; state: ReferralMarketState }

type TicketTheme = {
  surface: string
  ink: string
  accent: string
  stubTint: string
  qrInk: string
  qrPaper: string
  perf: string
}

const DEFAULT_THEME: TicketTheme = {
  surface: METAL,
  ink: INK,
  accent: INK,
  stubTint: "transparent",
  qrInk: INK,
  qrPaper: QR_PAPER,
  perf: "rgba(255,255,255,0.22)",
}

function marketTheme(skin: MarketSkin): TicketTheme {
  return {
    surface: skin.surface,
    ink: skin.ink,
    accent: skin.accent,
    stubTint: skin.stubTint,
    qrInk: skin.qrInk,
    qrPaper: skin.qrPaper,
    perf: `${skin.ink}55`,
  }
}

const loadMark = memo(async () => {
  const file = await readFile(path.join(PUBLIC, MARK_FILE))
  return `data:image/png;base64,${file.toString("base64")}`
})

function LiquidMark({ src, bodyWidth }: { src: string; bodyWidth: number }) {
  const height = Math.round(TICKET_HEIGHT * MARK_HEIGHT_RATIO)
  const width = Math.round(height * MARK_ASPECT)
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        left: 0,
        top: 0,
        width: bodyWidth,
        height: TICKET_HEIGHT,
        overflow: "hidden",
      }}
    >
      <img
        src={src}
        width={width}
        height={height}
        alt=""
        style={{
          position: "absolute",
          left: Math.round(bodyWidth * MARK_LEFT_RATIO),
          top: TICKET_HEIGHT + Math.round(TICKET_HEIGHT * MARK_BOTTOM_RATIO) - height,
        }}
      />
    </div>
  )
}

const loadLogoFile = memoBy(async (logo) => {
  const file = await readFile(path.join(PUBLIC, "logos", logo))
  const type = logo.endsWith(".svg") ? "image/svg+xml" : "image/png"
  return `data:${type};base64,${file.toString("base64")}`
})

function loadMarketLogo(skin: MarketSkin): Promise<string> {
  return loadLogoFile(skin.logo)
}

const textures = new Map<string, string>()

function marketTexture(skin: MarketSkin, width: number, height: number, split: number): string {
  const key = `${skin.id}:${width}:${height}:${split}`
  let texture = textures.get(key)
  if (!texture) {
    texture = dataUri(skin.texture(width, height, split))
    textures.set(key, texture)
  }
  return texture
}

function stubCopy(market: TicketMarket | undefined): { label: string; note: string } {
  if (!market) return { label: "Your cut", note: "of the fees Entropy makes on their io trades" }
  if (market.state === "boosted")
    return {
      label: "Your cut · boosted",
      note: `of the fees Entropy makes on every friend’s ${market.skin.name} trades until the boost ends`,
    }
  if (market.state === "unlocked")
    return {
      label: "Your cut · unlocked",
      note: `of the fees Entropy makes on ${market.skin.name} trades by friends who join from now on`,
    }
  return { label: "Your cut", note: `of the fees Entropy makes on their ${market.skin.name} trades` }
}

export async function renderTicketCard({
  username,
  memberNumber,
  url,
  displayUrl,
  market,
}: {
  username: string
  memberNumber?: number
  url: string
  displayUrl: string
  market?: TicketMarket
}) {
  const theme = market ? marketTheme(market.skin) : DEFAULT_THEME
  const [assets, marketLogo, mark] = await Promise.all([
    loadAssets(theme.ink),
    market ? loadMarketLogo(market.skin) : null,
    market ? null : loadMark(),
  ])
  const ticketWidth = OG_SIZE.width - MARGIN * 2
  const bodyWidth = ticketWidth - STUB_WIDTH
  const nameRoom = (bodyWidth - BODY_PADDING * 2) * (mark ? MARKED_NAME_ROOM : 1)
  const nameSize = usernameSize(username, nameRoom)
  const member = memberLabel(memberNumber)
  const qr = dataUri(qrSvg(url, theme.qrInk, theme.qrPaper))
  const texture = market ? marketTexture(market.skin, ticketWidth, TICKET_HEIGHT, bodyWidth) : null
  const copy = stubCopy(market)
  const rate = formatPercent(market ? market.rate : REFERRER_SHARE)

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: PAGE,
        padding: MARGIN,
        color: theme.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          width: ticketWidth,
          height: TICKET_HEIGHT,
          borderRadius: RADIUS,
          overflow: "hidden",
          background: theme.surface,
        }}
      >
        {texture ? (
          <img
            src={texture}
            width={ticketWidth}
            height={TICKET_HEIGHT}
            alt=""
            style={{ position: "absolute", left: 0, top: 0 }}
          />
        ) : null}
        {mark ? <LiquidMark src={mark} bodyWidth={bodyWidth} /> : null}
        <div
          style={{
            display: "flex",
            position: "relative",
            flexDirection: "column",
            justifyContent: "space-between",
            width: bodyWidth,
            height: "100%",
            padding: BODY_PADDING,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {marketLogo ? (
                <img
                  src={marketLogo}
                  width={44}
                  height={44}
                  alt=""
                  style={{ borderRadius: 22, border: `2px solid ${theme.ink}33` }}
                />
              ) : null}
              <img src={assets.logo} width={36} height={28} alt="" />
              <div
                style={{
                  display: "flex",
                  fontFamily: "EntropyMono",
                  fontSize: 17,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                }}
              >
                {market ? `${market.skin.name} pass` : "Invite pass"}
              </div>
            </div>
            {member ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "EntropyMono",
                  fontSize: 16,
                  letterSpacing: 3,
                  opacity: 0.62,
                }}
              >
                {member}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Label>{market ? `Trade ${market.skin.name} with` : "Trade io with"}</Label>
            <div
              style={{
                display: "flex",
                fontFamily: "Humane",
                fontSize: nameSize,
                lineHeight: 0.8,
                ...(mark ? { textShadow: "0 0 14px rgba(6,7,10,0.6), 0 2px 4px rgba(6,7,10,0.6)" } : {}),
              }}
            >
              {username}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Label>Link</Label>
            <div style={{ display: "flex", fontFamily: "EntropyMono", fontSize: 26 }}>{displayUrl}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: STUB_WIDTH,
            height: "100%",
            padding: "44px 40px",
            background: theme.stubTint,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Label>{copy.label}</Label>
            <div
              style={{
                display: "flex",
                fontFamily: "Humane",
                fontSize: 116,
                lineHeight: 0.8,
                color: theme.accent,
              }}
            >
              {rate}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Ciburial",
                fontSize: 17,
                lineHeight: 1.35,
                opacity: 0.9,
              }}
            >
              {copy.note}
            </div>
          </div>
          <img src={qr} width={176} height={176} alt="" />
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: bodyWidth - 1,
            top: NOTCH + 12,
            bottom: NOTCH + 12,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {Array.from({ length: PERF_DOTS }, (_, index) => (
            <div
              key={index}
              style={{ display: "flex", width: 3, height: 3, borderRadius: 2, background: theme.perf }}
            />
          ))}
        </div>
        <Notch left={bodyWidth} top={0} />
        <Notch left={bodyWidth} top={TICKET_HEIGHT} />
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Humane", data: assets.humane, weight: 700, style: "normal" },
        { name: "Ciburial", data: assets.ciburial, weight: 500, style: "normal" },
        { name: "EntropyMono", data: assets.mono, weight: 400, style: "normal" },
      ],
    },
  )
}
