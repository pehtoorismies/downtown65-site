import type { Event, ID, ULID } from '@downtown65/schema'
import { EventSchema } from '@downtown65/schema'
import { asc, eq, sql } from 'drizzle-orm'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { users, usersToEvent } from '~/db/schema'

export const getEvent = async (
  ctx: RequestContext,
  idOrUlid: ID | ULID,
  includeParticipants: boolean = true,
): Promise<Event | undefined> => {
  const db = getDb(ctx.db)

  const queryField = typeof idOrUlid === 'number' ? 'id' : 'eventULID'

  const event = await db.query.events.findFirst({
    where: {
      [queryField]: idOrUlid,
    },
    with: {
      createdBy: true,
    },
  })

  ctx.logger.withMetadata({ event }).debug(`Queried event by ${queryField}`)

  if (!event) {
    return undefined
  }

  if (!includeParticipants) {
    return EventSchema.decode({
      ...event,
      participants: [],
    })
  }

  // HACK - Drizzle doesn't support joinedAt in query
  const participantRows = await db
    .select({
      auth0Sub: users.auth0Sub,
      id: users.id,
      // SQLite's `CURRENT_TIMESTAMP` format (`2025-01-15 14:30:00`)
      // but  Participant expects ISO format (`2025-01-15T14:30:00Z`), so we replace the space with 'T' and append 'Z'
      joinedAt: sql<string>`replace(${usersToEvent.createdAt}, ' ', 'T') || 'Z'`,
      nickname: users.nickname,
      picture: users.picture,
    })
    .from(usersToEvent)
    .innerJoin(users, eq(usersToEvent.userId, users.id))
    .where(eq(usersToEvent.eventId, event.id))
    .orderBy(asc(usersToEvent.createdAt))

  return EventSchema.decode({
    ...event,
    participants: participantRows,
  })
}
