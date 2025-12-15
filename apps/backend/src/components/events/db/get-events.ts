import { createLogger } from '@downtown65/logger'
import { eq } from 'drizzle-orm'
import z from 'zod'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable, usersTable } from '~/db/schema'
import { EventSchema, UserSchema } from '../shared-schema'

const LeftJoinResult = z
  .object({
    events_table: EventSchema.omit({ createdBy: true, participants: true }),
    users_table: UserSchema,
  })
  .transform((_obj) => {
    return {
      ..._obj.events_table,
      participants: [],
      createdBy: {
        id: _obj.users_table.id,
        auth0Sub: _obj.users_table.auth0Sub,
        nickname: _obj.users_table.nickname,
      },
    }
  })

const EventParser = z.array(LeftJoinResult)

export const getEvents = async (config: Config) => {
  const db = getDb(config.D1_DB)
  const result = await db
    .select()
    .from(eventsTable)
    .leftJoin(usersTable, eq(usersTable.id, eventsTable.creatorId))

  const events = EventParser.parse(result)

  const logger = createLogger({ appContext: 'DB getEvents' })

  logger.withMetadata(events).debug('Events fetched from DB')

  return events
}
