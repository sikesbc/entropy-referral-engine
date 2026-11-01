export type MarketSkin = {
  id: string
  name: string
  logo: string
  surface: string
  ink: string
  accent: string
  stubTint: string
  qrInk: string
  qrPaper: string
  texture: (width: number, height: number, split: number) => string
}

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function svg(width: number, height: number, body: string, defs = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${defs}</defs>${body}</svg>`
}

function range(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index)
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function glow(id: string, color: string): string {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="1"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`
}

function blobs(
  width: number,
  height: number,
  seed: number,
  colors: string[],
  count: number,
  scale: number,
  opacity: number,
): { defs: string; body: string } {
  const random = seeded(seed)
  const defs = colors.map((color, index) => glow(`b${seed}-${index}`, color)).join("")
  const body = range(count)
    .map((index) => {
      const rx = round(scale * (0.6 + random() * 0.8))
      const ry = round(rx * (0.5 + random() * 0.5))
      return `<ellipse cx="${round(random() * width)}" cy="${round(random() * height)}" rx="${rx}" ry="${ry}" fill="url(#b${seed}-${index % colors.length})" opacity="${opacity}"/>`
    })
    .join("")
  return { defs, body }
}

function fibers(
  width: number,
  height: number,
  seed: number,
  count: number,
  colors: string[],
  opacity: number,
): string {
  const random = seeded(seed)
  return range(count)
    .map(() => {
      const x = random() * width
      const y = random() * height
      const length = 18 + random() * 70
      const angle = random() * Math.PI
      const bend = (random() - 0.5) * 18
      const x2 = x + Math.cos(angle) * length
      const y2 = y + Math.sin(angle) * length
      const color = colors[Math.floor(random() * colors.length)]
      return `<path d="M${round(x)} ${round(y)} Q${round((x + x2) / 2 + bend)} ${round((y + y2) / 2 - bend)} ${round(x2)} ${round(y2)}" stroke="${color}" stroke-width="${round(0.6 + random() * 1.1)}" fill="none" opacity="${round(opacity * (0.4 + random() * 0.6) * 100) / 100}"/>`
    })
    .join("")
}

function grain(
  width: number,
  height: number,
  seed: number,
  count: number,
  color: string,
  opacity: number,
): string {
  const random = seeded(seed)
  return range(count)
    .map(
      () =>
        `<rect x="${round(random() * width)}" y="${round(random() * height)}" width="1.6" height="1.6" fill="${color}" opacity="${round(opacity * random() * 100) / 100}"/>`,
    )
    .join("")
}

function pcbTraces(
  width: number,
  height: number,
  split: number,
  seed: number,
  trace: string,
  pad: string,
  padCount: number,
): string {
  const random = seeded(seed)
  const lanes = range(22).map((index) => round(24 + (index * (height - 48)) / 21))
  const paths = range(26)
    .map(() => {
      const y = lanes[Math.floor(random() * lanes.length)]
      const x = random() * width
      const run = 60 + random() * 260
      const drop = (random() > 0.5 ? 1 : -1) * (20 + random() * 50)
      const tail = 40 + random() * 180
      const x1 = x + run
      const x2 = x1 + Math.abs(drop)
      const y2 = y + drop
      return `<path d="M${round(x)} ${y} H${round(x1)} L${round(x2)} ${round(y2)} H${round(x2 + tail)}" stroke="${trace}" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="${round(x)}" cy="${y}" r="4.5" fill="none" stroke="${trace}" stroke-width="2"/>`
    })
    .join("")
  const pads = range(padCount)
    .map(() => {
      const x = round(40 + random() * (split - 120))
      const y = lanes[6 + Math.floor(random() * (lanes.length - 7))]
      return `<circle cx="${x}" cy="${y}" r="6.5" fill="${pad}"/><circle cx="${x}" cy="${y}" r="2.4" fill="#0b3d20"/>`
    })
    .join("")
  return paths + pads
}

function nvdaTexture(width: number, height: number, split: number): string {
  return svg(
    width,
    height,
    `<rect width="${width}" height="${height}" fill="url(#sheen)"/>${pcbTraces(width, height, split, 11, "#23794a", "#e8c766", 8)}`,
    `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.06"/><stop offset="1" stop-color="#000000" stop-opacity="0.18"/></linearGradient>`,
  )
}

function anthTexture(width: number, height: number): string {
  return svg(
    width,
    height,
    fibers(width, height, 21, 420, ["#b8a98c", "#cbbd9f", "#a8977a"], 0.45) +
      grain(width, height, 22, 900, "#7d6a4f", 0.35),
  )
}

function oaiTexture(width: number, height: number): string {
  return svg(
    width,
    height,
    `<rect width="${width}" height="${height}" fill="url(#top)"/>${grain(width, height, 31, 2600, "#ffffff", 0.09)}`,
    `<linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`,
  )
}

function sndkTexture(width: number, height: number): string {
  const lines = range(Math.ceil(height / 6))
    .map(
      (index) => `<rect x="0" y="${index * 6}" width="${width}" height="1" fill="#000000" opacity="0.07"/>`,
    )
    .join("")
  return svg(
    width,
    height,
    `${lines}<rect width="${width}" height="${height}" fill="url(#sheen)"/>`,
    `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0.2" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.12"/><stop offset="0.7" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`,
  )
}

function dramTexture(width: number, height: number, split: number): string {
  const random = seeded(41)
  const tooth = 22
  const gap = 8
  const count = Math.floor((split - 90) / (tooth + gap))
  const teeth = range(count)
    .map((index) => {
      const x = 40 + index * (tooth + gap)
      const tall = random() > 0.85 ? 24 : 30
      return `<rect x="${x}" y="${height - tall}" width="${tooth}" height="${tall + 6}" rx="3" fill="url(#gold)"/>`
    })
    .join("")
  const traces = range(18)
    .map(() => {
      const x = 40 + Math.floor(random() * count) * (tooth + gap) + tooth / 2
      const top = height - 120 - random() * 200
      return `<path d="M${x} ${height - 30} V${round(top)} l18 -18" stroke="#24774f" stroke-width="2.2" fill="none"/>`
    })
    .join("")
  return svg(
    width,
    height,
    `${traces}${teeth}`,
    `<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0c95e"/><stop offset="0.6" stop-color="#d29e33"/><stop offset="1" stop-color="#a9771d"/></linearGradient>`,
  )
}

function ionqTexture(width: number, height: number, split: number): string {
  const random = seeded(51)
  const stars = range(140)
    .map(
      () =>
        `<circle cx="${round(random() * width)}" cy="${round(random() * height)}" r="${round(0.6 + random() * 1.4)}" fill="#cfe6ff" opacity="${round(0.15 + random() * 0.35)}"/>`,
    )
    .join("")
  const y = height - 26
  const ions = range(11)
    .map((index) => {
      const x = 56 + index * ((split - 112) / 10)
      return `<circle cx="${round(x)}" cy="${y}" r="16" fill="url(#ion)" opacity="0.55"/><circle cx="${round(x)}" cy="${y}" r="3.4" fill="#eef4ff"/>`
    })
    .join("")
  const rails = `<rect x="36" y="${y - 22}" width="${split - 72}" height="1.5" fill="#5f8fe0" opacity="0.35"/><rect x="36" y="${y + 20}" width="${split - 72}" height="1.5" fill="#5f8fe0" opacity="0.35"/>`
  const field = blobs(width, height, 52, ["#2c62d8", "#1a4bb5"], 4, 260, 0.35)
  return svg(width, height, `${field.body}${stars}${rails}${ions}`, `${field.defs}${glow("ion", "#9cc4ff")}`)
}

function nbisTexture(width: number, height: number): string {
  const step = 22
  const dots = range(Math.ceil(height / step))
    .flatMap((row) =>
      range(Math.ceil(width / step)).map(
        (col) =>
          `<circle cx="${col * step + 11}" cy="${row * step + 11}" r="1.3" fill="#eef1f4" opacity="0.13"/>`,
      ),
    )
    .join("")
  return svg(
    width,
    height,
    `<rect width="${width}" height="${height}" fill="url(#steel)"/>${dots}`,
    `<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.04"/></linearGradient>`,
  )
}

function ewyTexture(width: number, height: number): string {
  const cx = 640
  const cy = 300
  const r = 190
  const taegeuk = `<g opacity="0.13"><path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} A${r / 2} ${r / 2} 0 0 1 ${cx} ${cy} A${r / 2} ${r / 2} 0 0 0 ${cx - r} ${cy}Z" fill="#c8303b"/><path d="M${cx - r} ${cy} A${r} ${r} 0 0 0 ${cx + r} ${cy} A${r / 2} ${r / 2} 0 0 1 ${cx} ${cy} A${r / 2} ${r / 2} 0 0 0 ${cx - r} ${cy}Z" fill="#0047a0"/></g>`
  return svg(
    width,
    height,
    fibers(width, height, 61, 480, ["#c9bc9c", "#d8cdb2", "#b9aa8a"], 0.5) +
      taegeuk +
      fibers(width, height, 62, 40, ["#c8303b", "#0047a0"], 0.55),
  )
}

function gproTexture(width: number, height: number): string {
  const step = 16
  const span = width + height
  const lines = range(Math.ceil(span / step))
    .map((index) => {
      const offset = index * step
      return `<path d="M${offset} 0 L${offset - height} ${height}" stroke="#3a3e44" stroke-width="1.4" opacity="0.55"/><path d="M${offset - height} 0 L${offset} ${height}" stroke="#3a3e44" stroke-width="1.4" opacity="0.55"/>`
    })
    .join("")
  return svg(
    width,
    height,
    `${lines}<rect width="${width}" height="${height}" fill="url(#shade)"/>`,
    `<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.06"/><stop offset="0.5" stop-color="#000000" stop-opacity="0.15"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.04"/></linearGradient>`,
  )
}

function tcntTexture(width: number, height: number): string {
  const cloud = blobs(width, height, 71, ["#3fb987", "#1f8a5f", "#8fe0bb"], 10, 180, 0.4)
  const random = seeded(72)
  const veins = range(7)
    .map(() => {
      const y = random() * height
      const c1 = random() * height
      const c2 = random() * height
      return `<path d="M0 ${round(y)} C${round(width * 0.3)} ${round(c1)} ${round(width * 0.6)} ${round(c2)} ${width} ${round(random() * height)}" stroke="#c9ffe4" stroke-width="${round(0.6 + random())}" fill="none" opacity="0.14"/>`
    })
    .join("")
  return svg(width, height, cloud.body + veins, cloud.defs)
}

function xiaomiTexture(width: number, height: number): string {
  const random = seeded(81)
  const lines = range(height)
    .filter(() => random() > 0.35)
    .map(
      (y) =>
        `<rect x="0" y="${y}" width="${width}" height="1" fill="${random() > 0.5 ? "#ffffff" : "#5b6066"}" opacity="${round(0.05 + random() * 0.18)}"/>`,
    )
    .join("")
  return svg(
    width,
    height,
    `${lines}<rect width="${width}" height="${height}" fill="url(#sheen)"/>`,
    `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0.15" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.4" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="0.65" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`,
  )
}

function prlTexture(width: number, height: number): string {
  const nacre = blobs(width, height, 91, ["#ffc4dc", "#fff0c9", "#d9d4ff", "#cdf3e6"], 14, 230, 0.75)
  return svg(
    width,
    height,
    `${nacre.body}<rect width="${width}" height="${height}" fill="url(#sheen)"/>`,
    `${nacre.defs}<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0.2" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.45"/><stop offset="0.8" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`,
  )
}

export const MARKET_SKINS: MarketSkin[] = [
  {
    id: "NVDA",
    name: "Nvidia",
    logo: "io_NVDA.png",
    surface: "linear-gradient(160deg, #136034 0%, #0c4625 60%, #0a3a1f 100%)",
    ink: "#f4f7f0",
    accent: "#9be03a",
    stubTint: "rgba(0,0,0,0.3)",
    qrInk: "#f4f7f0",
    qrPaper: "#0a3a1f",
    texture: nvdaTexture,
  },
  {
    id: "ANTH",
    name: "Anthropic",
    logo: "io_ANTH.png",
    surface: "linear-gradient(170deg, #f4efe4 0%, #ede6d7 60%, #e6ddca 100%)",
    ink: "#1f1b16",
    accent: "#b4532f",
    stubTint: "rgba(120,90,50,0.07)",
    qrInk: "#1f1b16",
    qrPaper: "#f4efe4",
    texture: anthTexture,
  },
  {
    id: "OAI",
    name: "OpenAI",
    logo: "io_OAI.png",
    surface: "linear-gradient(180deg, #19191c 0%, #111113 55%, #0c0c0d 100%)",
    ink: "#ededee",
    accent: "#ffffff",
    stubTint: "rgba(255,255,255,0.03)",
    qrInk: "#ededee",
    qrPaper: "#111113",
    texture: oaiTexture,
  },
  {
    id: "SNDK",
    name: "Sandisk",
    logo: "io_SNDK.svg",
    surface: "linear-gradient(160deg, #e01a10 0%, #c40f09 55%, #9e0a06 100%)",
    ink: "#fffaf7",
    accent: "#ffffff",
    stubTint: "rgba(60,0,0,0.22)",
    qrInk: "#fffaf7",
    qrPaper: "#8a0905",
    texture: sndkTexture,
  },
  {
    id: "DRAM",
    name: "DRAM",
    logo: "io_DRAM.png",
    surface: "linear-gradient(165deg, #12603f 0%, #0b4a30 60%, #083a26 100%)",
    ink: "#f3f6ef",
    accent: "#f0c95e",
    stubTint: "rgba(0,0,0,0.16)",
    qrInk: "#f3f6ef",
    qrPaper: "#083a26",
    texture: dramTexture,
  },
  {
    id: "IONQ",
    name: "IonQ",
    logo: "io_IONQ.png",
    surface: "linear-gradient(165deg, #0d3486 0%, #0b2c74 45%, #061a48 100%)",
    ink: "#eef4ff",
    accent: "#9cc4ff",
    stubTint: "rgba(0,0,20,0.2)",
    qrInk: "#eef4ff",
    qrPaper: "#061a48",
    texture: ionqTexture,
  },
  {
    id: "NBIS",
    name: "Nebius",
    logo: "io_NBIS.svg",
    surface: "linear-gradient(160deg, #2a2f36 0%, #171a1f 55%, #0b0c0f 100%)",
    ink: "#eef1f4",
    accent: "#d9ff4a",
    stubTint: "rgba(0,0,0,0.2)",
    qrInk: "#eef1f4",
    qrPaper: "#121418",
    texture: nbisTexture,
  },
  {
    id: "EWY",
    name: "South Korea",
    logo: "io_EWY.png",
    surface: "linear-gradient(170deg, #faf6ec 0%, #f3ecdc 60%, #ebe2cd 100%)",
    ink: "#1d1a16",
    accent: "#c8303b",
    stubTint: "rgba(110,90,50,0.07)",
    qrInk: "#1d1a16",
    qrPaper: "#faf6ec",
    texture: ewyTexture,
  },
  {
    id: "GPRO",
    name: "GoPro",
    logo: "io_GPRO.png",
    surface: "linear-gradient(180deg, #1a1c1f 0%, #0e0f11 55%, #08090a 100%)",
    ink: "#f3f4f6",
    accent: "#2fb8ee",
    stubTint: "rgba(0,0,0,0.3)",
    qrInk: "#f3f4f6",
    qrPaper: "#0a0b0c",
    texture: gproTexture,
  },
  {
    id: "TCNT",
    name: "Tencent",
    logo: "io_TCNT.png",
    surface: "linear-gradient(160deg, #0f6b48 0%, #08533a 55%, #033825 100%)",
    ink: "#effbf4",
    accent: "#f5e6a8",
    stubTint: "rgba(0,20,10,0.2)",
    qrInk: "#effbf4",
    qrPaper: "#033825",
    texture: tcntTexture,
  },
  {
    id: "XIAOMI",
    name: "Xiaomi",
    logo: "io_XIAOMI.svg",
    surface: "linear-gradient(170deg, #dcdfe2 0%, #c9ccd0 50%, #b4b8bd 100%)",
    ink: "#15171a",
    accent: "#c94f00",
    stubTint: "rgba(0,0,0,0.05)",
    qrInk: "#15171a",
    qrPaper: "#e3e5e8",
    texture: xiaomiTexture,
  },
  {
    id: "PRL",
    name: "Pearl",
    logo: "io_PRL.png",
    surface: "linear-gradient(160deg, #fdfbf9 0%, #f6eef0 55%, #efe6ea 100%)",
    ink: "#2b2233",
    accent: "#a2466f",
    stubTint: "rgba(120,80,110,0.05)",
    qrInk: "#2b2233",
    qrPaper: "#fdfbf9",
    texture: prlTexture,
  },
]

export function marketSkin(id: string | string[] | null | undefined): MarketSkin | null {
  if (typeof id !== "string") return null
  const key = id.trim().toUpperCase()
  return MARKET_SKINS.find((skin) => skin.id === key) ?? null
}
