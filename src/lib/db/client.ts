import { drizzle } from 'drizzle-orm/d1'

import * as schema from '@/db/schema'

import type { CloudflareBindings, D1Database } from './types'

export type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>

const instances = new WeakMap<D1Database, DrizzleDatabase>()

const shouldLog = process.env.NODE_ENV === 'development'

export function createDb(database: D1Database): DrizzleDatabase {
  const existing = instances.get(database)
  if (existing) return existing

  const instance = drizzle(database, { schema, logger: shouldLog })
  instances.set(database, instance)
  return instance
}

export function getDbFromBindings(bindings: CloudflareBindings): DrizzleDatabase {
  if (!bindings?.DB) {
    throw new Error('Cloudflare D1 binding `DB` is not available in the provided bindings.')
  }
  return createDb(bindings.DB)
}

export { schema }
