import { eq } from 'drizzle-orm'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { events as eventsTable } from '~/db/schema'

export const deleteEvent = async (
  ctx: RequestContext,
  id: number,
): Promise<boolean> => {
  const db = getDb(ctx.db)
  const deletedEvent = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, id))
    .returning()

  return deletedEvent.length !== 0
}
