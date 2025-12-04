import { z } from 'zod'
import { TimeHHMM } from './common'
import { UserSchema } from './user'

// ============================================
// Event Type Enum
// ============================================

export const eventTypes = [
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

export const EventTypeEnum = z.enum(eventTypes)

// ============================================
// Event Schemas
// ============================================

export const EventBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  date: z.iso.date(),
  time: TimeHHMM,
  type: EventTypeEnum,
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  participants: z.array(UserSchema),
})

export const EventSchema = EventBaseSchema.extend({
  id: z.string().min(1),
})

export const EventCreateSchema = EventBaseSchema

export const EventUpdateSchema = EventBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
)

export const EventListSchema = z.array(EventSchema)

// ============================================
// Type Exports
// ============================================

export type EventType = z.infer<typeof EventTypeEnum>
export type Event = z.infer<typeof EventSchema>
export type EventCreate = z.infer<typeof EventCreateSchema>
export type EventUpdate = z.infer<typeof EventUpdateSchema>
export type EventList = z.infer<typeof EventListSchema>
