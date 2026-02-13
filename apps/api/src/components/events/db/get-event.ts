import type { Event, ID, ULID } from '@downtown65/schema'
import { EventSchema } from '@downtown65/schema'

import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'

export const getEvent = async (
  ctx: RequestContext,
  idOrUlid: ID | ULID,
): Promise<Event | undefined> => {
  const db = getDb(ctx.db)

  const queryField = typeof idOrUlid === 'number' ? 'id' : 'eventULID'

  const event = await db.query.events.findFirst({
    where: {
      [queryField]: idOrUlid,
    },
    with: {
      createdBy: true,
      participants: true,
    },
  })

  ctx.logger.withMetadata({ event }).debug(`Queried event by ${queryField}`)

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
