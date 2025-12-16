import { createLogger } from '@downtown65/logger'
import type { EventType, ULID } from '@downtown65/schema'
import { eq } from 'drizzle-orm'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable, usersTable } from '~/db/schema'
import type { Event } from '../shared-schema'

export const getEventByULID = async (
  config: Config,
  eventULID: ULID,
): Promise<Event | undefined> => {
  const logger = createLogger({ appContext: 'DB: Get Event By ULID' })
  const db = getDb(config.D1_DB)
  const event = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.eventULID, eventULID))
    .innerJoin(usersTable, eq(eventsTable.creatorId, usersTable.id))

  logger.withMetadata({ data: event }).debug('Queried event by ULID')

  if (event.length === 0) {
    return undefined
  }

  const returnedEvent = {
    ...event[0].events_table,
    type: event[0].events_table.type as EventType,
    description: event[0].events_table.description || undefined,
    createdBy: {
      ...event[0].users_table,
    },
    time: event[0].events_table.time || undefined,
    participants: [],
  }

  return returnedEvent
}
