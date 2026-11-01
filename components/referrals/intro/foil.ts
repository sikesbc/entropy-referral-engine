const SPARK_TINTS = ["255 255 255", "214 232 255", "210 246 236", "234 220 255", "255 222 240", "226 240 255"]
const SPARK_EASE = "cubic-bezier(0.16, 1, 0.3, 1)"

function span(parent: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  const node = document.createElement("span")
  Object.assign(node.style, { position: "absolute", pointerEvents: "none", ...style })
  parent.appendChild(node)
  return node
}

export function burst(host: HTMLElement, origin: HTMLElement) {
  const box = host.getBoundingClientRect()
  const from = origin.getBoundingClientRect()
  const radius = from.height / 2
  const layer = document.createElement("div")
  layer.setAttribute("aria-hidden", "true")
  Object.assign(layer.style, {
    position: "absolute",
    left: `${from.left + from.width / 2 - box.left}px`,
    top: `${from.top + from.height / 2 - box.top}px`,
    width: "0px",
    height: "0px",
    pointerEvents: "none",
    zIndex: "2",
  })
  host.appendChild(layer)

  const ring = span(layer, {
    left: `${-radius}px`,
    top: `${-radius}px`,
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    borderRadius: "999px",
    border: "1px solid rgb(236 240 255 / 0.6)",
  })
  const animations = [
    ring.animate(
      [
        { transform: "scale(1)", opacity: 0.8 },
        { transform: "scale(2.6)", opacity: 0 },
      ],
      { duration: 560, easing: SPARK_EASE, fill: "both" },
    ),
  ]

  const count = 16
  for (let index = 0; index < count; index++) {
    const angle = (index / count) * 360 + (Math.random() - 0.5) * 16
    const streak = index % 3 !== 0
    const width = streak ? 2 : 3.5
    const height = streak ? 8 + Math.random() * 4 : 3.5
    const tint = SPARK_TINTS[index % SPARK_TINTS.length]
    const reach = radius + 18 + Math.random() * 20
    const spark = span(layer, {
      left: `${-width / 2}px`,
      top: `${-height / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: "999px",
      background: `rgb(${tint})`,
      boxShadow: `0 0 6px rgb(${tint} / 0.85)`,
    })
    animations.push(
      spark.animate(
        [
          {
            transform: `rotate(${angle}deg) translateY(${-radius * 0.8}px) scale(0.7)`,
            opacity: 0,
            easing: SPARK_EASE,
          },
          { opacity: 1, offset: 0.1, easing: "cubic-bezier(0.55, 0, 0.75, 0.2)" },
          { transform: `rotate(${angle}deg) translateY(${-reach}px) scale(0.35)`, opacity: 0 },
        ],
        { duration: 640 + Math.random() * 240, delay: Math.random() * 60, easing: "linear", fill: "both" },
      ),
    )
  }

  const remove = () => layer.remove()
  Promise.all(animations.map((animation) => animation.finished)).then(remove, remove)
}

export function sweep(skin: HTMLElement) {
  const band = document.createElement("div")
  band.setAttribute("aria-hidden", "true")
  Object.assign(band.style, {
    position: "absolute",
    top: "-20%",
    bottom: "-20%",
    left: "0",
    width: "70%",
    pointerEvents: "none",
    mixBlendMode: "screen",
    background:
      "linear-gradient(100deg, transparent 0%, rgb(150 205 255 / 0.10) 28%, rgb(255 255 255 / 0.22) 46%, rgb(232 196 255 / 0.15) 60%, rgb(184 255 230 / 0.08) 74%, transparent 100%)",
  })
  skin.appendChild(band)
  const remove = () => band.remove()
  band
    .animate(
      [{ transform: "translateX(-110%) skewX(-14deg)" }, { transform: "translateX(170%) skewX(-14deg)" }],
      { duration: 900, delay: 60, easing: "cubic-bezier(0.33, 0, 0.2, 1)", fill: "both" },
    )
    .finished.then(remove, remove)
}
