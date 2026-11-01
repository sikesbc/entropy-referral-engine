export function FeedViewHeader({ title }: { title: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-[1.25rem] font-semibold tracking-[-0.02em]">{title}</h1>
      </div>
    </header>
  )
}
