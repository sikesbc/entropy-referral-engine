import { HEAD_CELL } from "./activity-cells"

export function ActivityTableHead({
  columns,
  hasActions = false,
}: {
  columns: string[]
  hasActions?: boolean
}) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column} scope="col" className={HEAD_CELL}>
            {column}
          </th>
        ))}
        {hasActions ? <th scope="col" className={HEAD_CELL} aria-label="Actions" /> : null}
      </tr>
    </thead>
  )
}
