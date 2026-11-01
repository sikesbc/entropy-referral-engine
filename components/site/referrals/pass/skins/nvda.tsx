import { NvdaArt } from "./nvda-board"
import { NVDA_CSS } from "./nvda-css"
import type { Skin } from "./types"

export const nvdaSkin: Skin = {
  id: "NVDA",
  name: "Nvidia",
  logo: "/logos/io_NVDA.png",
  css: NVDA_CSS,
  Art: NvdaArt,
}
