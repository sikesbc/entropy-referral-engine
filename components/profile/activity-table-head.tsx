import { TABLE_HEAD_CLASS } from "./profile-styles"

export function ActivityTableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr>
        {columns.map((column, index) => (
          <th
            key={column}
            className={index === columns.length - 1 ? `${TABLE_HEAD_CLASS} text-right` : TABLE_HEAD_CLASS}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  )
}
