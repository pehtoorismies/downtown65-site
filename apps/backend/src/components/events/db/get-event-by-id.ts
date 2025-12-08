import type { ULID } from '../shared-schema'
import { getDb } from './get-db'

export const getEventById = async (d1DB: D1Database, _idd: ULID) => {
  const db = getDb(d1DB)
  db.select
  return undefined
}
