import {
  type Auth0Sub,
  type Event,
  type EventCreateInput,
  ISODateSchema,
  ISOTimeSchema,
} from '@downtown65/schema'
import { eq } from 'drizzle-orm'
import { ulid } from 'ulidx'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable, usersTable } from '~/db/schema'

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

  // TODO: add input.includeEventCreator participation handling

  const event = await db
    .insert(eventsTable)
    .values({
      ...input,
      eventULID: ULID,
      createdBy: localUser.id,
    })
    .returning()

  return {
    ...event[0],
    timeStart: ISOTimeSchema.parse(event[0].timeStart),
    dateStart: ISODateSchema.parse(event[0].dateStart),
    createdBy: localUser,
    participants: [],
  }
}
