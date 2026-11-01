import { lazySkin } from "./lazy-skin"
import type { Skin } from "./types"

export const nvdaSkin = lazySkin({
  id: "NVDA",
  name: "Nvidia",
  logo: "/logos/io_NVDA.png",
  vars: "--ink: #f4f7f0; --qr-bg: #05200f;",
  face: "#0c4625",
  load: () => import("./nvda").then((module) => module.nvdaSkin),
})

export const anthSkin = lazySkin({
  id: "ANTH",
  name: "Anthropic",
  logo: "/logos/io_ANTH.png",
  vars: "--ink: #1e1c19; --qr-bg: #f4efe4;",
  face: "#ede6d7",
  load: () => import("./anth").then((module) => module.anthSkin),
})

export const oaiSkin = lazySkin({
  id: "OAI",
  name: "OpenAI",
  logo: "/logos/io_OAI.png",
  vars: "--ink: #ededee; --qr-bg: #0a0a0b;",
  face: "#0c0c0d",
  load: () => import("./oai").then((module) => module.oaiSkin),
})

export const sndkSkin = lazySkin({
  id: "SNDK",
  name: "Sandisk",
  logo: "/logos/io_SNDK.svg",
  vars: "--ink: #fff6f2; --qr-bg: #fffaf7;",
  face: "#b80c08",
  load: () => import("./sndk").then((module) => module.sndkSkin),
})

export const dramSkin = lazySkin({
  id: "DRAM",
  name: "DRAM",
  logo: "/logos/io_DRAM.png",
  vars: "--ink: #f3f6ef; --qr-bg: #f6f6f0;",
  face: "#0a5a38",
  load: () => import("./dram").then((module) => module.dramSkin),
})

export const ionqSkin = lazySkin({
  id: "IONQ",
  name: "IonQ",
  logo: "/logos/io_IONQ.png",
  vars: "--ink: #eef4ff; --qr-bg: #e7efff;",
  face: "#061a48",
  load: () => import("./ionq").then((module) => module.ionqSkin),
})

export const nbisSkin = lazySkin({
  id: "NBIS",
  name: "Nebius",
  logo: "/logos/io_NBIS.svg",
  vars: "--ink: #eef1f4; --qr-bg: #eceef0;",
  face: "#2a2e34",
  load: () => import("./nbis").then((module) => module.nbisSkin),
})

export const ewySkin = lazySkin({
  id: "EWY",
  name: "South Korea",
  logo: "/logos/io_EWY.png",
  vars: "--ink: #1d1b18; --qr-bg: #f8f4ea;",
  face: "#eee5d1",
  load: () => import("./ewy").then((module) => module.ewySkin),
})

export const gproSkin = lazySkin({
  id: "GPRO",
  name: "GoPro",
  logo: "/logos/io_GPRO.png",
  vars: "--ink: #f3f4f6; --qr-bg: #0b0c0d;",
  face: "#141517",
  load: () => import("./gpro").then((module) => module.gproSkin),
})

export const tcntSkin = lazySkin({
  id: "TCNT",
  name: "Tencent",
  logo: "/logos/io_TCNT.png",
  vars: "--ink: #effbf4; --qr-bg: #03231a;",
  face: "#0a4434",
  load: () => import("./tcnt").then((module) => module.tcntSkin),
})

export const xiaomiSkin = lazySkin({
  id: "XIAOMI",
  name: "Xiaomi",
  logo: "/logos/io_XIAOMI.svg",
  vars: "--ink: #141619; --qr-bg: #eef0f2;",
  face: "#b4b7bb",
  load: () => import("./xiaomi").then((module) => module.xiaomiSkin),
})

export const prlSkin = lazySkin({
  id: "PRL",
  name: "Pearl",
  logo: "/logos/io_PRL.png",
  vars: "--ink: #26222e; --qr-bg: #fbf9f7;",
  face: "#efebe6",
  load: () => import("./prl").then((module) => module.prlSkin),
})

export const SKINS: Skin[] = [
  nvdaSkin,
  anthSkin,
  oaiSkin,
  sndkSkin,
  dramSkin,
  ionqSkin,
  nbisSkin,
  ewySkin,
  gproSkin,
  tcntSkin,
  xiaomiSkin,
  prlSkin,
]

export function skinFor(id: string): Skin | undefined {
  return SKINS.find((skin) => skin.id === id)
}

export { mainSkin } from "./main"
