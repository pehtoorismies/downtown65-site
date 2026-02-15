import { IDSchema } from '@downtown65/schema'
import { z } from 'zod'

const EventParticipationParamsSchema = z.object({
  eventId: IDSchema,
  sub: z.string(),
})

export type EventParticipationParams = z.infer<
  typeof EventParticipationParamsSchema
>
