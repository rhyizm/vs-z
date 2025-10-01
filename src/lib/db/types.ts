export interface D1Result<T = unknown> {
  success: boolean
  error?: string
  results?: T[]
  meta?: {
    duration?: number
  }
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(shouldThrow?: boolean): Promise<T | null>
  run<T = unknown>(): Promise<D1Result<T>>
  all<T = unknown>(): Promise<D1Result<T>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>
  dump(): Promise<ArrayBuffer>
  exec(query: string): Promise<void>
}

export interface CloudflareBindings {
  DB: D1Database
}
