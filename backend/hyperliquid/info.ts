import "server-only"

const INFO_URL = process.env.HYPERLIQUID_INFO_URL ?? "https://api.hyperliquid.xyz/info"
const MAX_ATTEMPTS = 4

export type UserRole =
  | { role: "user" }
  | { role: "agent"; data: { user: string } }
  | { role: "subAccount"; data: { master: string } }
  | { role: "vault" }
  | { role: "missing" }

export type HyperliquidFill = {
  coin: string
  px: string
  sz: string
  side: string
  time: number
  hash: string
  tid: number
  fee: string
  feeToken: string
  builderFee?: string
  crossed: boolean
  dir: string
}

export type SubAccount = { subAccountUser: string; name: string }

async function post<T>(body: Record<string, unknown>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(INFO_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    if (response.ok) return (await response.json()) as T
    if (response.status !== 429 || attempt >= MAX_ATTEMPTS) {
      throw new Error(`Hyperliquid ${String(body.type)} failed: ${response.status}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
  }
}

export function getUserRole(user: string) {
  return post<UserRole>({ type: "userRole", user })
}

export async function getSubAccounts(user: string) {
  return (await post<SubAccount[] | null>({ type: "subAccounts", user })) ?? []
}

export function getFillsByTime(user: string, startTime: number, endTime?: number) {
  return post<HyperliquidFill[]>({
    type: "userFillsByTime",
    user,
    startTime,
    endTime,
    aggregateByTime: false,
  })
}

export function rootAddress(address: string, role: UserRole): string | null {
  if (role.role === "agent") return role.data.user.toLowerCase()
  if (role.role === "subAccount") return role.data.master.toLowerCase()
  if (role.role === "vault") return null
  return address.toLowerCase()
}
