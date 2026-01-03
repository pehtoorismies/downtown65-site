import { createLogger } from '@downtown65/logger'
import type { EventUpdateInput, ID } from '@downtown65/schema'
import { eq, sql } from 'drizzle-orm'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'
import { events } from '~/db/schema'

export const updateEvent = async (
  config: Config,
  eventId: ID,
  input: EventUpdateInput,
): Promise<boolean> => {
  const logger = createLogger({ appContext: 'DB updateEvent' })
  logger.withMetadata({ eventId, input }).debug('Updating event in DB')
  const db = getDb(config.D1_DB)

  try {
    await db
      .update(events)
      .set({
        title: input.title,
        subtitle: input.subtitle,
        dateStart: input.dateStart,
        timeStart: input.timeStart,
        eventType: input.eventType,
        description: input.description,
        location: input.location,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(events.id, eventId))
  } catch (error) {
    logger.withError(error as Error).error('Failed to update event in DB')
    return false
  }

  return true
}
