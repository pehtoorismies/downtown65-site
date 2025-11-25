import { z } from '@hono/zod-openapi'

export const UserSchema = z.object({
  id: z.string().min(1).openapi({ example: 'usr_123' }),
  name: z.string().min(1).openapi({ example: 'Ada Lovelace' }),
  nickname: z.string().min(1).openapi({ example: 'ada' }),
})

export const ParticipantListSchema = z
  .array(UserSchema)
  .openapi({ description: 'Users attending the event' })

export const EventBaseSchema = z.object({
  title: z.string().min(1).openapi({ example: 'Engineering Sync' }),
  subtitle: z.string().min(1).openapi({ example: 'Weekly updates' }),
  date: z.string().date().openapi({ example: '2025-01-15' }),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .openapi({ example: '14:30' }),
  type: z.string().min(1).openapi({ example: 'meeting' }),
  description: z.string().min(1).openapi({ example: 'Discuss roadmap' }),
  location: z.string().min(1).openapi({ example: 'Room 301' }),
  participants: ParticipantListSchema,
})

export const EventSchema = EventBaseSchema.extend({
  id: z.string().min(1).openapi({ example: 'evt_123' }),
})

export const EventListSchema = z.array(EventSchema)

export const EventCreateSchema = EventBaseSchema
export const EventUpdateSchema = EventBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'At least one field must be provided to update an event.',
  },
)

export type User = z.infer<typeof UserSchema>
export type Event = z.infer<typeof EventSchema>
export type EventCreateInput = z.infer<typeof EventCreateSchema>
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>
