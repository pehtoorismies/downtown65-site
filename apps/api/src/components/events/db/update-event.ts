import type { EventUpdateInput, ID } from '@downtown65/schema'
import { eq, sql } from 'drizzle-orm'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { events } from '~/db/schema'

export const updateEvent = async (
  ctx: RequestContext,
  eventId: ID,
  input: EventUpdateInput,
): Promise<boolean> => {
  ctx.logger.withMetadata({ eventId, input }).debug('Updating event in DB')
  const db = getDb(ctx.db)

  try {
    await db
      .update(events)
      .set({
        dateStart: input.dateStart,
        description: input.description,
        eventType: input.eventType,
        location: input.location,
        subtitle: input.subtitle,
        timeStart: input.timeStart,
        title: input.title,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(events.id, eventId))
  } catch (error) {
    ctx.logger.withError(error as Error).error('Failed to update event in DB')
    return false
  }

  return true
}
