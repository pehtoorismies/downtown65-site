import type { Auth0Sub } from '@downtown65/schema'
import { eq } from 'drizzle-orm'
import { ulid } from 'ulidx'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable, usersTable } from '~/db/schema'
import type { Event, EventCreateInput } from '../shared-schema'

export const createEvent = async (
  config: Config,
  input: EventCreateInput,
  creator: { auth0Sub: Auth0Sub; includeInEvent: boolean },
): Promise<Event> => {
  const db = getDb(config.D1_DB)

  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.auth0Sub, creator.auth0Sub))

  if (result.length === 0) {
    throw new Error('Creator user not found')
  }
  const localUser = result[0]

  const ULID = ulid()

  const event = await db
    .insert(eventsTable)
    .values({
      ...input,
      eventULID: ULID,
      creatorId: localUser.id,
    })
    .returning({ id: eventsTable.id })

  return {
    ...input,
    id: event[0].id,
    eventULID: ULID,
    createdBy: localUser,
  }
}
