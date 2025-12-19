import { isValid as isValidULID } from 'ulidx'
import { z } from 'zod'
// add .openapi() to zod schemas
import '@hono/zod-openapi'

export const PaginationQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

// ============================================
// IDs
// ============================================
export const Auth0SubSchema = z.string().startsWith('auth0|').openapi({
  description: 'Auth0 Subject Identifier',
  example: 'auth0|1234567890',
})
export type Auth0Sub = z.infer<typeof Auth0SubSchema>

export const IDSchema = z.number().int().positive().openapi({
  description: 'Positive integer ID',
  example: 1212121,
})
export type ID = z.infer<typeof IDSchema>

export const ULIDSchema = z.string().refine((v) => {
  return isValidULID(v)
}, 'Invalid ULID')
export type ULID = z.infer<typeof ULIDSchema>

export const StringIDSchema = z.object({
  id: z
    .string()
    .transform((s) => Number(s))
    .pipe(IDSchema),
})

// ============================================
// Dates and Times
// ============================================
export const ISODateSchema = z.iso.date().brand<'ISODate'>()
export const ISOTimeSchema = z.iso.time({ precision: -1 }).brand<'ISOTime'>()
export type ISOTime = z.infer<typeof ISOTimeSchema>
export const ISODateTimeSchema = z.iso.datetime().brand<'ISODateTime'>()

// ============================================
// Dates and Times
// ============================================
export const UserSchema = z.object({
  auth0Sub: Auth0SubSchema,
  id: IDSchema,
  nickname: z.string().min(1).openapi({ example: 'ada' }),
  picture: z.httpUrl(),
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
export type ParticipantList = z.infer<typeof ParticipantListSchema>

// ============================================
// Events
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

export const EventSchema = z.object({
  id: IDSchema,
  eventULID: ULIDSchema,
  title: z.string().min(1).openapi({ example: 'Kaamoshiihto' }),
  subtitle: z.string().min(1).openapi({ example: 'Lapin taikaa kaamoksessa' }),
  dateStart: ISODateSchema.openapi({ example: '2025-01-15' }),
  timeStart: ISOTimeSchema.nullable().openapi({ example: '14:30' }),
  eventType: EventTypeEnum.openapi({
    example: 'MEETING',
    description: 'Type of the event.',
  }),
  description: z.string().nullable().openapi({ example: 'Hiihtokisat' }),
  location: z.string().min(1).openapi({ example: 'Hakunila, Vantaa' }),
  participants: ParticipantListSchema,
  createdBy: UserSchema,
  race: z.boolean().openapi({ example: false }),
  // TODO: Add createdAt and updatedAt fields if needed
})
export type Event = z.infer<typeof EventSchema>

export const EventListSchema = z.array(EventSchema)
export type EventList = z.infer<typeof EventListSchema>

export const EventUpdateSchema = EventSchema.omit({
  id: true,
  eventULID: true,
  createdBy: true,
  participants: true,
})
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update an event.',
  })
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

// ============================================
// Authentication
// ============================================
export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string('Password required'),
  rememberMe: z.string().nullable().optional(),
})
export type Login = z.infer<typeof LoginSchema>

// ============================================
// Codecs
// ============================================
export const stringToID = z.codec(
  z.string().regex(z.regexes.integer),
  IDSchema,
  {
    decode: (str, ctx) => {
      const num = Number.parseInt(str, 10)

      // Must be positive integer
      if (num <= 0) {
        ctx.issues.push({
          code: 'invalid_format',
          format: 'integer',
          input: str,
          message: 'Invalid non-positive integer string',
        })
        return z.NEVER
      }

      return num
    },
    encode: (num) => {
      return num.toString()
    },
  },
)

export const isoDateToDate = z.codec(ISODateSchema, z.date(), {
  decode: (isoDateString, ctx) => {
    // Expect "YYYY-MM-DD"
    const [yearStr, monthStr, dayStr] = isoDateString.split('-')
    const year = Number(yearStr)
    const month = Number(monthStr)
    const day = Number(dayStr)

    // Basic numeric checks
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      ctx.issues.push({
        code: 'invalid_format',
        format: 'iso_date',
        input: isoDateString,
        message: 'Expected YYYY-MM-DD',
      })
      return z.NEVER
    }

    // Construct in local time (month is 0-based)
    const date = new Date(year, month - 1, day)

    // Strict validation: ensure no rollover happened
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      ctx.issues.push({
        code: 'invalid_format',
        format: 'iso_date',
        input: isoDateString,
        message: 'Invalid calendar date',
      })
      return z.NEVER
    }

    return date
  },

  encode: (date) => {
    console.error('Encoding date', date.getUTCDate())

    // Format YYYY-MM-DD using UTC components to avoid TZ offsets
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
    const _iso = `${y}-${m}-${d}`
    console.error('_iso', _iso)
    // Return a branded ISODate string, verified by schema
    //
    return ISODateSchema.decode(date.toISOString().substring(0, 10))
  },
})

// ============================================
// Generic
// ============================================
export const MessageSchema = z.object({
  message: z.string().openapi({ example: 'Information regarding request' }),
})

export const APIErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
})
