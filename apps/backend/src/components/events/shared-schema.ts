import { isValid as isValidULID } from 'ulidx'
import { z } from 'zod'
import { Auth0SubSchema, IDSchema } from '~/common/schema'

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

export const ULID = z
  .string()
  .refine((v) => {
    return isValidULID(v)
  }, 'Invalid ULID')
  .openapi({
    description:
      'Id is ULID. ULIDs are Universally Unique Lexicographically Sortable Identifiers.',
    example: '01KBAWMEFMZTHDD52MA2D8PTDY',
  })

export const UserSchema = z.object({
  auth0Sub: Auth0SubSchema,
  id: IDSchema,
  nickname: z.string().min(1).openapi({ example: 'ada' }),
})

export type User = z.infer<typeof UserSchema>

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
  id: IDSchema,
  eventULID: ULID,
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

export const EventListSchema = z.array(EventSchema)

export const EventUpdateSchema = EventSchema.omit({ id: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update an event.',
  })
export type Event = z.infer<typeof EventSchema>
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>

export type ULID = z.infer<typeof ULID>
export const EventCreateSchema = EventSchema.omit({
  id: true,
  eventULID: true,
  createdBy: true,
}).extend({
  createdByUserId: IDSchema,
})
export type EventCreateInput = z.infer<typeof EventCreateSchema>
