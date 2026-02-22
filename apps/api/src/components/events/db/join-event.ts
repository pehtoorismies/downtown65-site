import { DrizzleQueryError } from 'drizzle-orm'
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

export const joinEvent = async (
  ctx: RequestContext,
  input: EventParticipationParams,
): Promise<Response> => {
  const db = getDb(ctx.db)
  ctx.logger.withContext(input)

  ctx.logger.info(`Start joining event`)
  const user = await db.query.users.findFirst({
    where: {
      sub: input.sub,
    },
  })
  if (!user) {
    ctx.logger.fatal('User not found when joining event')
    throw new Error('User not found')
  }
  try {
    await db.insert(usersToEvent).values({
      eventId: input.eventId,
      userId: user.id,
    })
    ctx.logger.info(`User joined event`)
    return {
      message: `User with ID ${user.id} joined the event ${input.eventId} successfully`,
      type: 'Success',
    }
  } catch (err: unknown) {
    if (err instanceof DrizzleQueryError) {
      const cause = String(err.cause)

      if (cause.includes('FOREIGN KEY constraint failed')) {
        return {
          error: `Event with ID ${input.eventId} not found`,
          type: 'EventNotFound',
        }
      }
      if (cause.includes('UNIQUE constraint failed')) {
        return {
          message: `User already joined event with ID ${input.eventId}`,
          type: 'Success',
        }
      }
    }
    throw err
  }
}
