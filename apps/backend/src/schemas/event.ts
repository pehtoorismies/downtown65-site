import { z } from '@hono/zod-openapi'
import { isValid } from 'ulidx'

const eventTypes = [
  'CYCLING',
  'KARONKKA',
  'MEETING',
  'NORDIC_WALKING',
  'ICE_HOCKEY',
  'ORIENTEERING',
  'OTHER',
  'RUNNING',
  'SKIING',
  'SPINNING',
  'SWIMMING',
  'TRACK_RUNNING',
  'TRAIL_RUNNING',
  'TRIATHLON',
  'ULTRAS',
] as const

const EventTypeEnum = z.enum(eventTypes)

const TimeHHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:MM (00–23:59)')
  .openapi({
    description: 'Must be HH:MM (00–23:59)',
    example: '14:30',
  })

const ULID = z
  .string()
  .refine((v) => {
    return isValid(v)
  }, 'Invalid ULID')
  .openapi({
    description: 'Id is ULID. ULIDs are Universally Unique Lexicographically Sortable Identifiers.',
    example: '01KBAWMEFMZTHDD52MA2D8PTDY',
  })

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
  date: z.date().openapi({ example: '2025-01-15' }),
  time: TimeHHMM,
  type: EventTypeEnum.openapi({
    example: 'MEETING',
    description: 'Type of the event.',
  }),
  description: z.string().min(1).openapi({ example: 'Discuss roadmap' }),
  location: z.string().min(1).openapi({ example: 'Room 301' }),
  participants: ParticipantListSchema,
})

export const EventPathParamSchema = z.object({
  id: ULID,
})

export const EventSchema = EventBaseSchema.extend({
  id: ULID,
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
