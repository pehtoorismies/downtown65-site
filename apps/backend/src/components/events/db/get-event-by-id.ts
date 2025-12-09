import { eq } from 'drizzle-orm'
import { eventsTable } from '~/db/schema'
import type { ULID } from '../shared-schema'
import { getDb } from './get-db'

export const getEventByULID = async (d1DB: D1Database, id: ULID) => {
  const db = getDb(d1DB)
  const event = await db.select().from(eventsTable).where(eq(eventsTable.eventULID, id))
  return event[0] ?? undefined
}
