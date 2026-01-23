import { createLogger } from '@downtown65/logger'
import { and, eq } from 'drizzle-orm'
import z from 'zod'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'
import { usersToEvent } from '~/db/schema'
import type { EventParticipationParams } from '../shared-schema'

const ResponseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('EventNotFound'), error: z.string() }),
  z.object({
    type: z.literal('Success'),
    message: z.string(),
  }),
])

type Response = z.infer<typeof ResponseSchema>

export const leaveEvent = async (
  config: Config,
  input: EventParticipationParams,
): Promise<Response> => {
  const db = getDb(config.D1_DB)
  const logger = createLogger({ appContext: 'DB joinEvent' })
  logger.withContext(input)

  logger.debug(`Start leaving event`)
  const user = await db.query.users.findFirst({
    where: {
      auth0Sub: input.userAuth0Sub,
    },
  })
  if (!user) {
    logger.fatal('User not found when joining event')
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
    logger.warn(
      `No participation record found for user ${user.id} in event ${input.eventId}`,
    )
    return {
      type: 'Success',
      message: `User was not registered for event ${input.eventId}`,
    }
  }

  logger.info(`User ${user.id} left event ${input.eventId} successfully`)
  return {
    type: 'Success',
    message: `User left the event ${input.eventId} successfully`,
  }
}
