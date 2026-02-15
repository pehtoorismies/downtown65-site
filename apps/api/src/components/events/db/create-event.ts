import type { EventCreateInput, ULID } from '@downtown65/schema'
import { ulid } from 'ulidx'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { events, usersToEvent } from '~/db/schema'

export const createEvent = async (
  ctx: RequestContext,
  input: EventCreateInput,
  creatorSub: string,
): Promise<ULID> => {
  const db = getDb(ctx.db)

  const localUser = await db.query.users.findFirst({
    where: {
      sub: creatorSub,
    },
  })

  if (!localUser) {
    throw new Error('Creator user not found')
  }

  const eventULID = ulid()

  const createdEvent = await db
    .insert(events)
    .values({
      ...input,
      creatorId: localUser.id,
      eventULID,
    })
    .returning()

  if (createdEvent.length === 0) {
    throw new Error('Failed to create event')
  }

  if (input.includeEventCreator) {
    await db.insert(usersToEvent).values({
      eventId: createdEvent[0].id,
      userId: localUser.id,
    })
  }

  return eventULID
}
