import { db, schema } from '@/db'

export function getDb() {
  return db
}

export { db, schema }
