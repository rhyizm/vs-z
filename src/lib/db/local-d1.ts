import { existsSync, readdirSync, statSync } from 'node:fs'
import { promises as fs } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import type { D1Database, D1PreparedStatement, D1Result } from './types'
import type { CloudflareBindings } from './types'

type SqliteModule = typeof import('node:sqlite')

class SqliteD1PreparedStatement implements D1PreparedStatement {
  private boundValues: unknown[] = []

  constructor(private readonly stmt: InstanceType<SqliteModule['StatementSync']>) {}

  bind(...values: unknown[]): this {
    this.boundValues = values
    return this
  }

  async first<T = unknown>(shouldThrow?: boolean): Promise<T | null> {
    try {
      const result = this.stmt.get(...this.consumeBound()) as T | undefined
      if (result === undefined || result === null) {
        if (shouldThrow) {
          throw new Error('No result returned from statement.')
        }
        return null
      }
      return result
    } catch (error) {
      if (shouldThrow) {
        throw error instanceof Error ? error : new Error(String(error))
      }
      return null
    }
  }

  async run<T = unknown>(): Promise<D1Result<T>> {
    const start = performance.now()
    try {
      const info = this.stmt.run(...this.consumeBound()) as {
        lastInsertRowid?: number | bigint
        changes?: number
      }

      return {
        success: true,
        meta: {
          duration: performance.now() - start,
          changes: info.changes ?? 0,
          lastInsertRowid:
            typeof info.lastInsertRowid === 'bigint'
              ? Number(info.lastInsertRowid)
              : info.lastInsertRowid ?? undefined,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    try {
      const results = this.stmt.all(...this.consumeBound()) as T[]
      return { success: true, results }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  async raw<T = unknown>(): Promise<T[]> {
    const rows = (await this.all<Record<string, unknown>>()).results ?? []
    const columns = this.stmt.columns().map((column) => column.name)
    return rows.map((row) => columns.map((column) => row[column]) as T)
  }

  private consumeBound() {
    const values = this.boundValues
    this.boundValues = []
    return values
  }
}

class SqliteD1Database implements D1Database {
  constructor(
    private readonly filePath: string,
    private readonly database: InstanceType<SqliteModule['DatabaseSync']>,
  ) {}

  prepare(query: string): D1PreparedStatement {
    const statement = this.database.prepare(query)
    return new SqliteD1PreparedStatement(statement)
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]> {
    const results: T[] = []
    for (const statement of statements) {
      results.push((await statement.run()) as T)
    }
    return results
  }

  async dump(): Promise<ArrayBuffer> {
    const buffer = await fs.readFile(this.filePath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }

  async exec(query: string): Promise<void> {
    this.database.exec(query)
  }
}

type LocalBindingCache = {
  binding: CloudflareBindings
  database: InstanceType<SqliteModule['DatabaseSync']>
  path: string
}

const localBindingSymbol = Symbol.for('sozoku.localD1Binding')

function getCache() {
  const globalContext = globalThis as typeof globalThis & {
    [localBindingSymbol]?: LocalBindingCache
  }

  return globalContext
}

function findLocalDatabasePath() {
  const baseDir = resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject')

  if (!existsSync(baseDir)) {
    return null
  }

  const candidates = readdirSync(baseDir)
    .filter((entry) => entry.endsWith('.sqlite'))
    .map((entry) => {
      const fullPath = join(baseDir, entry)
      return {
        path: fullPath,
        mtime: statSync(fullPath).mtimeMs,
      }
    })
    .sort((a, b) => b.mtime - a.mtime)

  return candidates[0]?.path ?? null
}

export async function getLocalD1Bindings(): Promise<CloudflareBindings | null> {
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const cacheContainer = getCache()
  const cached = cacheContainer[localBindingSymbol]

  if (cached && existsSync(cached.path)) {
    return cached.binding
  }

  if (cached?.database) {
    try {
      cached.database.close()
    } catch (error) {
      console.warn('Failed to close cached local D1 database connection.', error)
    }
  }

  const databasePath = findLocalDatabasePath()

  if (!databasePath) {
    delete cacheContainer[localBindingSymbol]
    return null
  }

  let sqliteModule: SqliteModule

  try {
    sqliteModule = (await import('node:sqlite')) as SqliteModule
  } catch (error) {
    console.warn(
      'Local D1 fallback requires Node.js 22 or later with the experimental node:sqlite module.',
      error,
    )
    return null
  }
  const database = new sqliteModule.DatabaseSync(databasePath)
  const db = new SqliteD1Database(databasePath, database)

  const binding: CloudflareBindings = {
    DB: db,
  }

  cacheContainer[localBindingSymbol] = {
    binding,
    database,
    path: databasePath,
  }

  return binding
}
