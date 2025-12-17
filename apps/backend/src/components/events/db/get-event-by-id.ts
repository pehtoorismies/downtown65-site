import { createLogger } from '@downtown65/logger'
import type { Event, ULID } from '@downtown65/schema'
import { ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import { eq } from 'drizzle-orm'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable, usersTable } from '~/db/schema'

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
    .innerJoin(usersTable, eq(eventsTable.createdBy, usersTable.id))

  logger.withMetadata({ data: event }).debug('Queried event by ULID')

  if (event.length === 0) {
    return undefined
  }

  const parseResult = ISOTimeSchema.safeParse(event[0].events_table.timeStart)
  const timeStart = parseResult.success ? parseResult.data : null
  const dateStart = ISODateSchema.parse(event[0].events_table.dateStart)

  const returnedEvent = {
    ...event[0].events_table,
    createdBy: event[0].users_table,
    dateStart,
    timeStart,
    participants: [],
  }

  return returnedEvent
}
