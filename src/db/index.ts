import { config } from 'dotenv'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema'

config({ path: process.env.DOTENV_CONFIG_PATH ?? '.env' })

const connectionUrl =
  process.env.TURSO_CONNECTION_URL ?? process.env.DATABASE_URL

if (!connectionUrl) {
  throw new Error('TURSO_CONNECTION_URL (または DATABASE_URL) が設定されていません。')
}

const authToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN

const client = createClient(
  authToken ? { url: connectionUrl, authToken } : { url: connectionUrl },
)

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export { schema }
