import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const url = process.env.TURSO_CONNECTION_URL ?? process.env.DATABASE_URL

if (!url) {
  console.error('TURSO_CONNECTION_URL (または DATABASE_URL) が設定されていません。')
  process.exit(1)
}

const authToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN

const client = createClient(
  authToken ? { url, authToken } : { url },
)

const db = drizzle(client)

const dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.resolve(dirname, '../migrations')

try {
  await migrate(db, { migrationsFolder })
  console.log('Migrations applied successfully.')
} catch (error) {
  console.error('Migration failed:', error)
  process.exitCode = 1
} finally {
  if (typeof client.close === 'function') {
    await client.close()
  }
}
