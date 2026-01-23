import { createLogger } from '@downtown65/logger'
import { type EventList, EventListSchema } from '@downtown65/schema'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'

export const getEvents = async (config: Config): Promise<EventList> => {
  const db = getDb(config.D1_DB)
  const logger = createLogger({ appContext: 'DB getEvents' })

  const result = await db.query.events.findMany({
    where: {
      dateStart: { gte: new Date().toISOString().slice(0, 10) },
    },
    with: {
      createdBy: true,
      participants: true,
    },
    orderBy: (events, { asc }) => [
      asc(events.dateStart),
      asc(events.timeStart),
    ],
  })

  const withJoinedAt = result.map((event) => {
    return {
      ...event,
      participants: event.participants.map((p) => {
        return {
          ...p,
          joinedAt: new Date().toISOString(),
        }
      }),
    }
  })

  const events = EventListSchema.decode(withJoinedAt)
  logger.withMetadata(events).debug('Events fetched from DB')

  return events
}
