import type { D1Database } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export function createDb(binding: D1Database) {
  return drizzle(binding, { schema })
}

export type Database = ReturnType<typeof createDb>
