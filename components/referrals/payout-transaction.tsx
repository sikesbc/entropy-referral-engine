const HYPEREVM_CHAIN_ID = 999
const TX_HASH_PATTERN = /^0x[0-9a-f]{64}$/i

export function PayoutTransaction({ hash, chainId }: { hash: string; chainId: number | null }) {
  const short = `${hash.slice(0, 8)}…${hash.slice(-6)}`
  if (chainId !== HYPEREVM_CHAIN_ID || !TX_HASH_PATTERN.test(hash)) {
    return (
      <span className="font-mono" title={hash}>
        {short}
      </span>
    )
  }
  return (
    <a
      href={`https://hyperevmscan.io/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      title={hash}
      className="font-mono hover:text-ink"
    >
      {short} ↗
    </a>
  )
}
