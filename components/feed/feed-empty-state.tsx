export type FeedEmptyAction = { label: string; onClick: () => void }

export function FeedEmptyState({
  title,
  text,
  action,
}: {
  title?: string
  text: string
  action?: FeedEmptyAction
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {title ? <h2 className="text-[0.9375rem] font-medium text-ink">{title}</h2> : null}
      <p className="max-w-[22rem] text-[0.8125rem] text-ink-quiet">{text}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex h-7 items-center rounded-[0.375rem] bg-panel-2 px-3 text-[0.75rem] font-medium text-ink transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:text-ink-quiet dark:bg-panel-3 mt-2"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
