import { eq } from 'drizzle-orm'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable } from '~/db/schema'

export const deleteEvent = async (
  config: Config,
  id: number,
): Promise<boolean> => {
  const db = getDb(config.D1_DB)
  const deletedEvent = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, id))
    .returning()

  return deletedEvent.length !== 0
}
