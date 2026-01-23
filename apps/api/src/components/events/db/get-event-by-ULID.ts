import { createLogger } from '@downtown65/logger'
import type { Event, ULID } from '@downtown65/schema'
import { EventSchema } from '@downtown65/schema'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'

export const getEventByULID = async (
  config: Config,
  eventULID: ULID,
): Promise<Event | undefined> => {
  const logger = createLogger({ appContext: 'DB: Get Event By ULID' })
  const db = getDb(config.D1_DB)

  const event = await db.query.events.findFirst({
    where: {
      eventULID,
    },
    with: {
      createdBy: true,
      participants: true,
    },
  })

  logger.withMetadata({ event }).debug('Queried event by ULID')

  if (!event) {
    return undefined
  }

  const e = {
    ...event,
    participants: event.participants.map((p) => {
      return {
        ...p,
        joinedAt: new Date().toISOString(),
      }
    }),
  }

  return EventSchema.decode(e)
}
