export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly body: unknown,
  ) {
    super(`Request to ${path} failed with ${status}`)
  }
}

export type QueryValue = string | number | boolean | null | undefined

export function toSearchParams(params: Record<string, QueryValue> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ""
}

async function parse<T>(response: Response, path: string): Promise<T> {
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, path, body)
  return body as T
}

export async function apiGet<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  const response = await fetch(`${path}${toSearchParams(params)}`, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  })
  return parse<T>(response, path)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  return parse<T>(response, path)
}
