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
    const { auth0Sub: sub, ...createdByRest } = event.createdBy
    return {
      ...event,
      createdBy: { ...createdByRest, sub },
      participants: event.participants.map((p) => {
        const { auth0Sub: sub, ...rest } = p
        return {
          ...rest,
          joinedAt: new Date().toISOString(),
          sub,
        }
      }),
    }
  })

  const events = EventListSchema.decode(withJoinedAt)
  ctx.logger.withMetadata(events).debug('Events fetched from DB')

  return events
}
