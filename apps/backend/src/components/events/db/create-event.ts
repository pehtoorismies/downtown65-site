import { ulid } from 'ulidx'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { eventsTable } from '~/db/schema'
import type { Event, EventCreateInput } from '../shared-schema'

export const createEvent = async (
  config: Config,
  input: EventCreateInput,
): Promise<Event> => {
  const db = getDb(config.D1_DB)
  const ULID = ulid()

  const event = await db
    .insert(eventsTable)
    .values({
      ...input,
      eventULID: ULID,
      creatorId: input.createdByUserId,
    })
    .returning({ id: eventsTable.id })

  return {
    ...input,
    id: event[0].id,
    eventULID: ULID,
    createdBy: {
      id: input.createdByUserId,
      auth0Sub: 'auth0|unknown',
      name: 'change',
      nickname: 'change',
    },
  }
}
