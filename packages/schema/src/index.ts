import { isValid as isValidULID } from 'ulidx'
import { z } from 'zod'

/**
 * Time in HH:MM format (00:00 - 23:59)
 */
export const TimeHHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:MM (00–23:59)')

export type TimeHHMM = z.infer<typeof TimeHHMM>

export const PaginationQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

// ============================================
// Event Type Enum
// ============================================

export const EVENT_TYPES = [
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

export const EventTypeEnum = z.enum(EVENT_TYPES)
export type EventType = z.infer<typeof EventTypeEnum>

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string('Password required'),
  rememberMe: z.string().nullable().optional(),
})
export type Login = z.infer<typeof LoginSchema>

export const Auth0SubSchema = z.string().startsWith('auth0|')

export const IDSchema = z.number().int().positive()

export type Auth0Sub = z.infer<typeof Auth0SubSchema>
export type ID = z.infer<typeof IDSchema>

export const ULIDSchema = z.string().refine((v) => {
  return isValidULID(v)
}, 'Invalid ULID')

export type ULID = z.infer<typeof ULIDSchema>

// .openapi({
//   description:
//     'Id is ULID. ULIDs are Universally Unique Lexicographically Sortable Identifiers.',
//   example: '01KBAWMEFMZTHDD52MA2D8PTDY',
// })

// export type { Login } from './auth'
// // Auth schemas
// export { LoginSchema } from './auth'

// export type {
//   Event,
//   EventCreate,
//   EventList,
//   EventType,
//   EventUpdate,
// } from './event'
// // Event schemas
// export {
//   EVENT_TYPES as eventTypes,
//   EventBaseSchema,
//   EventCreateSchema,
//   EventListSchema,
//   EventSchema,
//   EventTypeEnum,
//   EventUpdateSchema,
// } from './event'
// export type { DetailedUser, User, UserList, UserUpdate } from './user'
// // User schemas
// export {
//   DetailedUserSchema,
//   UserListSchema,
//   UserSchema,
//   UserUpdateSchema,
// } from './user'
