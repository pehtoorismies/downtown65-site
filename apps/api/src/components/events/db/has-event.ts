import type { ID, ULID } from '@downtown65/schema'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'

export const hasEvent = async (
  ctx: RequestContext,
  idOrUlid: ID | ULID,
): Promise<boolean> => {
  const db = getDb(ctx.db)

  const queryField = typeof idOrUlid === 'number' ? 'id' : 'eventULID'

  const event = await db.query.events.findFirst({
    where: {
      [queryField]: idOrUlid,
    },
  })

  ctx.logger.withMetadata({ event }).debug(`Queried event by ${queryField}`)

  return !!event
}
