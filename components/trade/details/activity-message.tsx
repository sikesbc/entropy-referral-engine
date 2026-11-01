export function ActivityMessage({
  children,
  spacing = "py-12",
}: {
  children: string
  spacing?: "py-10" | "py-12"
}) {
  return <p className={`${spacing} text-center text-[0.8125rem] text-ink-quiet`}>{children}</p>
}
