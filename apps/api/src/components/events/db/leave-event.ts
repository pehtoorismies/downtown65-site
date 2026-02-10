import { and, eq } from 'drizzle-orm'
import z from 'zod'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { usersToEvent } from '~/db/schema'
import type { EventParticipationParams } from '../shared-schema'

const ResponseSchema = z.discriminatedUnion('type', [
  z.object({ error: z.string(), type: z.literal('EventNotFound') }),
  z.object({
    message: z.string(),
    type: z.literal('Success'),
  }),
])

type Response = z.infer<typeof ResponseSchema>

export const leaveEvent = async (
  ctx: RequestContext,
  input: EventParticipationParams,
): Promise<Response> => {
  const db = getDb(ctx.db)
  ctx.logger.withContext(input)

  ctx.logger.debug(`Start leaving event`)
  const user = await db.query.users.findFirst({
    where: {
      auth0Sub: input.userAuth0Sub,
    },
  })
  if (!user) {
    ctx.logger.fatal('User not found when joining event')
    throw new Error('User not found')
  }

  const result = await db
    .delete(usersToEvent)
    .where(
      and(
        eq(usersToEvent.eventId, input.eventId),
        eq(usersToEvent.userId, user.id),
      ),
    )
    .returning()

  if (result.length === 0) {
    ctx.logger.warn(
      `No participation record found for user ${user.id} in event ${input.eventId}`,
    )
    return {
      message: `User was not registered for event ${input.eventId}`,
      type: 'Success',
    }
  }

  ctx.logger.info(`User ${user.id} left event ${input.eventId} successfully`)
  return {
    message: `User left the event ${input.eventId} successfully`,
    type: 'Success',
  }
}
