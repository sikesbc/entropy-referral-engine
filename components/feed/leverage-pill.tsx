export function LeveragePill({ leverage }: { leverage: number }) {
  return (
    <span className="inline-flex h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-full py-0 font-mono text-[0.6875rem] font-semibold leading-none bg-[var(--entropy-orange)]/15 px-2 text-[var(--entropy-orange)]">
      {leverage}×
    </span>
  )
}
