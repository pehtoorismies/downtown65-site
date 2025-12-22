import type { Auth0Sub, EventCreateInput, ULID } from '@downtown65/schema'
import { ulid } from 'ulidx'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'
import { events, usersToEvent } from '~/db/schema'

export const createEvent = async (
  config: Config,
  input: EventCreateInput,
  creator: { auth0Sub: Auth0Sub; includeInEvent: boolean },
): Promise<ULID> => {
  const db = getDb(config.D1_DB)

  const localUser = await db.query.users.findFirst({
    where: {
      auth0Sub: creator.auth0Sub,
    },
  })

  if (!localUser) {
    throw new Error('Creator user not found')
  }

  const eventULID = ulid()

  await db.transaction(
    async (tx) => {
      const createdEvent = await tx
        .insert(events)
        .values({
          ...input,
          eventULID,
          createdBy: localUser.id,
        })
        .returning()

      if (createdEvent.length === 0) {
        throw new Error('Failed to create event')
      }
      if (creator.includeInEvent) {
        await tx.insert(usersToEvent).values({
          userId: localUser.id,
          eventId: createdEvent[0].id,
        })
      }

      return createdEvent[0].eventULID
    },
    {
      behavior: 'deferred',
    },
  )
  return eventULID
}
