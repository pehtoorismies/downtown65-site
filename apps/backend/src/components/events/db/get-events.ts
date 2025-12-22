import { createLogger } from '@downtown65/logger'
import { type EventList, EventSchema, UserSchema } from '@downtown65/schema'
import { eq } from 'drizzle-orm'
import z from 'zod'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable, usersTable } from '~/db/schema'

const LeftJoinResult = z
  .object({
    events_table: EventSchema.omit({ createdBy: true, participants: true }),
    users_table: UserSchema,
  })
  .transform((obj) => {
    return {
      ...obj.events_table,
      participants: [],
      createdBy: obj.users_table,
    }
  })

const EventParser = z.array(LeftJoinResult)

export const getEvents = async (config: Config): Promise<EventList> => {
  const db = getDb(config.D1_DB)

  const result = await db
    .select()
    .from(eventsTable)
    .leftJoin(usersTable, eq(usersTable.id, eventsTable.createdBy))

  const events = EventParser.parse(result)

  const logger = createLogger({ appContext: 'DB getEvents' })

  logger.withMetadata(events).debug('Events fetched from DB')

  return events
}
