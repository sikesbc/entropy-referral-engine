import "server-only"
import postgres from "postgres"

const globalForDb = globalThis as unknown as { sql?: postgres.Sql }

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return postgres(url, {
    prepare: false,
    ssl: "require",
    max: 3,
    idle_timeout: 20,
    max_pipeline: 1,
    types: {
      bigint: {
        to: 20,
        from: [20],
        serialize: (value: number) => String(value),
        parse: (value: string) => Number(value),
      },
    },
  })
}

export function db(): postgres.Sql {
  globalForDb.sql ??= createClient()
  return globalForDb.sql
}
