import { createLogger } from '@downtown65/logger'
import { DrizzleQueryError } from 'drizzle-orm'
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

export const joinEvent = async (
  config: Config,
  input: EventParticipationParams,
): Promise<Response> => {
  const db = getDb(config.D1_DB)
  const logger = createLogger({ appContext: 'DB joinEvent' })
  logger.withContext(input)

  logger.info(`Start joining event`)
  const user = await db.query.users.findFirst({
    where: {
      auth0Sub: input.userAuth0Sub,
    },
  })
  if (!user) {
    logger.fatal('User not found when joining event')
    throw new Error('User not found')
  }
  try {
    await db.insert(usersToEvent).values({
      eventId: input.eventId,
      userId: user.id,
    })
    logger.info(`User joined event`)
    return {
      type: 'Success',
      message: `User joined the event ${input.eventId} successfully`,
    }
  } catch (err: unknown) {
    if (err instanceof DrizzleQueryError) {
      const cause = String(err.cause)

      if (cause.includes('FOREIGN KEY constraint failed')) {
        return {
          type: 'EventNotFound',
          error: `Event with ID ${input.eventId} not found`,
        }
      }
      if (cause.includes('UNIQUE constraint failed')) {
        return {
          type: 'Success',
          message: `User already joined event with ID ${input.eventId}`,
        }
      }
    }
    throw err
  }
}
