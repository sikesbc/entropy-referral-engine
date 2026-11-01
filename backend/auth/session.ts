import "server-only"
import { PrivyClient } from "@privy-io/node"
import { chooseWallet, linkedEthereumWallets } from "./wallets"

export type SessionUser = { privyUserId: string; walletAddress: string }

const globalForPrivy = globalThis as unknown as { privy?: PrivyClient }

function privyClient(): PrivyClient {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const appSecret = process.env.PRIVY_APP_SECRET
  if (!appId || !appSecret) throw new Error("NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET must be set")
  globalForPrivy.privy ??= new PrivyClient({ appId, appSecret })
  return globalForPrivy.privy
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")
  const match = header ? /^Bearer\s+(\S+)$/i.exec(header) : null
  return match ? match[1] : null
}

async function verifiedUserId(client: PrivyClient, token: string): Promise<string | null> {
  try {
    return (await client.utils().auth().verifyAccessToken(token)).user_id
  } catch {
    return null
  }
}

export async function getSessionUserId(request: Request): Promise<string | null> {
  const token = bearerToken(request)
  return token ? verifiedUserId(privyClient(), token) : null
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const privyUserId = await getSessionUserId(request)
  if (!privyUserId) return null
  const user = await privyClient().users()._get(privyUserId)
  const walletAddress = chooseWallet(
    linkedEthereumWallets(user.linked_accounts),
    request.headers.get("x-wallet-address"),
  )
  return walletAddress ? { privyUserId, walletAddress } : null
}
