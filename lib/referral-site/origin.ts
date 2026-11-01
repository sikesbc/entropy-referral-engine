import "server-only"
import { headers } from "next/headers"

export async function requestOrigin(): Promise<string> {
  const list = await headers()
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000"
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1")
  const protocol = list.get("x-forwarded-proto") ?? (local ? "http" : "https")
  return `${protocol}://${host}`
}
