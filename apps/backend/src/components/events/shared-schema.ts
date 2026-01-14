import { Auth0SubSchema, IDSchema } from '@downtown65/schema'
import { z } from 'zod'

const EventParticipationParamsSchema = z.object({
  eventId: IDSchema,
  userAuth0Sub: Auth0SubSchema,
})

export type EventParticipationParams = z.infer<
  typeof EventParticipationParamsSchema
>
