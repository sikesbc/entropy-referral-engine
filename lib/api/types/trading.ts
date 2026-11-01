export type Fill = {
  coin: string
  px: string
  sz: string
  side: "A" | "B"
  time: number
  startPosition: string
  dir: string
  closedPnl: string
  hash: string
  oid: number
  crossed: boolean
  fee: string
  tid: number
  feeToken: string
  builderFee?: string
  twapId?: number | null
}

export type FillsParams = {
  user: string
  startTime: number
  endTime: number
}

export type FillsResponse = Fill[]
