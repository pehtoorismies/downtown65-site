import { z } from 'zod'
import { ULID } from '../shared-schema'

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

const UserSchema = z.object({
  id: z.string().min(1).openapi({ example: 'usr_123' }),
  name: z.string().min(1).openapi({ example: 'Ada Lovelace' }),
  nickname: z.string().min(1).openapi({ example: 'ada' }),
})

const Participant = UserSchema.extend({
  joinedAt: z.iso.datetime().openapi({
    description: 'Timestamp when the user joined the event',
    example: '2025-01-15T14:30:00Z',
  }),
})

const ParticipantListSchema = z
  .array(Participant)
  .openapi({ description: 'Users attending the event' })

export const EventSchema = z.object({
  id: ULID,
  title: z.string().min(1).openapi({ example: 'Engineering Sync' }),
  subtitle: z.string().min(1).openapi({ example: 'Weekly updates' }),
  date: z.iso.date().openapi({ example: '2025-01-15' }),
  time: TimeHHMM,
  type: EventTypeEnum.openapi({
    example: 'MEETING',
    description: 'Type of the event.',
  }),
  description: z.string().min(1).openapi({ example: 'Discuss roadmap' }),
  location: z.string().min(1).openapi({ example: 'Room 301' }),
  participants: ParticipantListSchema,
  createdBy: UserSchema,
  race: z.boolean().openapi({ example: false }),
})

export const EventPathParamSchema = z.object({
  id: ULID,
})

export const EventListSchema = z.array(EventSchema)

export const EventCreateSchema = EventSchema
export const EventUpdateSchema = EventSchema.omit({ id: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update an event.',
  })

export type Event = z.infer<typeof EventSchema>
export type EventCreateInput = z.infer<typeof EventCreateSchema>
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>

export const MessageSchema = z.object({
  message: z.string().openapi({ example: 'Information regarding request' }),
})
