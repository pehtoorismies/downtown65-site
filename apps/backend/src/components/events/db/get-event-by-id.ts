import type { ULID } from '@downtown65/schema'
import { eq } from 'drizzle-orm'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable } from '~/db/schema'

export const getEventByULID = async (config: Config, eventULID: ULID) => {
  const db = getDb(config.D1_DB)
  const event = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.eventULID, eventULID))
  return event[0] ?? undefined
}
