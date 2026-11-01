export function ShowMoreButton({ isLoading, onClick }: { isLoading: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-center px-3 pb-4">
      <button
        type="button"
        disabled={isLoading}
        onClick={onClick}
        className="lite-raised-chip h-9 rounded-full px-5 text-[0.8125rem] font-medium text-ink disabled:opacity-60"
      >
        {isLoading ? "Loading…" : "Show more"}
      </button>
    </div>
  )
}
