import {
  Auth0SubSchema,
  EventTypeEnum,
  IDSchema,
  ISODateSchema,
  ISODateTimeSchema,
  ISOTimeSchema,
  ULIDSchema,
} from '@downtown65/schema'
import { z } from 'zod'

// .openapi({
//   description: 'Must be HH:MM (00–23:59)',
//   example: '14:30',
// })

export const UserSchema = z.object({
  auth0Sub: Auth0SubSchema,
  id: IDSchema,
  nickname: z.string().min(1).openapi({ example: 'ada' }),
})

export type User = z.infer<typeof UserSchema>

const Participant = UserSchema.extend({
  joinedAt: ISODateTimeSchema.openapi({
    description: 'Timestamp when the user joined the event',
    example: '2025-01-15T14:30:00Z',
  }),
})

const ParticipantListSchema = z
  .array(Participant)
  .openapi({ description: 'Users attending the event' })

export const EventSchema = z.object({
  id: IDSchema,
  eventULID: ULIDSchema,
  title: z.string().min(1).openapi({ example: 'Engineering Sync' }),
  subtitle: z.string().min(1).openapi({ example: 'Weekly updates' }),
  date: ISODateSchema.openapi({ example: '2025-01-15' }),
  time: ISOTimeSchema.optional().openapi({ example: '14:30' }),
  type: EventTypeEnum.openapi({
    example: 'MEETING',
    description: 'Type of the event.',
  }),
  description: z.string().optional().openapi({ example: 'Discuss roadmap' }),
  location: z.string().min(1).openapi({ example: 'Room 301' }),
  participants: ParticipantListSchema,
  createdBy: UserSchema,
  race: z.boolean().openapi({ example: false }),
})

export const EventListSchema = z.array(EventSchema)

export const EventUpdateSchema = EventSchema.omit({ id: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update an event.',
  })
export type Event = z.infer<typeof EventSchema>
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>

export const EventCreateSchema = EventSchema.omit({
  id: true,
  eventULID: true,
  createdBy: true,
  participants: true,
}).extend({
  includeEventCreator: z.boolean().optional().default(false),
})
export type EventCreateInput = z.infer<typeof EventCreateSchema>
