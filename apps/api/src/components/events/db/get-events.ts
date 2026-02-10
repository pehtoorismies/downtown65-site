import { type EventList, EventListSchema } from '@downtown65/schema'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'

export const getEvents = async (ctx: RequestContext): Promise<EventList> => {
  const db = getDb(ctx.db)

  const result = await db.query.events.findMany({
    orderBy: (events, { asc }) => [
      asc(events.dateStart),
      asc(events.timeStart),
    ],
    where: {
      dateStart: { gte: new Date().toISOString().slice(0, 10) },
    },
    with: {
      createdBy: true,
      participants: true,
    },
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
  ctx.logger.withMetadata(events).debug('Events fetched from DB')

  return events
}
