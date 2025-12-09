import { ulid } from 'ulidx'
import { eventsTable } from '~/db/schema'
import type {} from '../routes/api-schema'
import type { Event, EventCreateInput } from '../shared-schema'
import { getDb } from './get-db'

export const createEvent = async (d1DB: D1Database, input: EventCreateInput): Promise<Event> => {
  const db = getDb(d1DB)
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
