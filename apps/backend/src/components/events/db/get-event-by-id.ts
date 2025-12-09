import { eq } from 'drizzle-orm'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable } from '~/db/schema'
import type { ULID } from '../shared-schema'

export const getEventByULID = async (config: Config, id: ULID) => {
  const db = getDb(config.D1_DB)
  const event = await db.select().from(eventsTable).where(eq(eventsTable.eventULID, id))
  return event[0] ?? undefined
}
