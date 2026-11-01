import "server-only"

const ADDRESS_PATTERN = /^0x[0-9a-f]{40}$/

export function normalizeAddress(input: string): string | null {
  const candidate = input.trim().toLowerCase()
  return ADDRESS_PATTERN.test(candidate) ? candidate : null
}
