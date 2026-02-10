import type { Event, ID } from '@downtown65/schema'
import { EventSchema } from '@downtown65/schema'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'

export const getEventById = async (
  ctx: RequestContext,
  id: ID,
): Promise<Event | undefined> => {
  const db = getDb(ctx.db)

  const event = await db.query.events.findFirst({
    where: {
      id,
    },
    with: {
      createdBy: true,
      participants: true,
    },
  })

  ctx.logger.withMetadata({ event }).debug('Queried event by ID')

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
