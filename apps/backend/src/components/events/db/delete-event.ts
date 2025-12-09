import { eq } from 'drizzle-orm'
import { eventsTable } from '~/db/schema'
import { getDb } from './get-db'

export const deleteEvent = async (d1DB: D1Database, id: number): Promise<boolean> => {
  const db = getDb(d1DB)
  const deletedEvent = await db.delete(eventsTable).where(eq(eventsTable.id, id)).returning()

  return deletedEvent.length !== 0
}
