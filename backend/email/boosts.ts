export type ActiveBoost = { coin: string; rate: string; until: Date }

export function boostEventKey(coin: string, until: Date): string {
  return `boost:${coin}:${until.toISOString()}`
}

export function pendingBoosts(boosts: ActiveBoost[], notifiedKeys: ReadonlySet<string>): ActiveBoost[] {
  const seen = new Set<string>()
  return boosts.filter((boost) => {
    const key = boostEventKey(boost.coin, boost.until)
    if (notifiedKeys.has(key) || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
