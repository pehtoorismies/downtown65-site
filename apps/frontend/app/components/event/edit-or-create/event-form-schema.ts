import { EventTypeEnum, ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import z from 'zod'

export const EventFormSchema = z.object({
  dateStart: ISODateSchema,
  description: z.codec(z.string(), z.string().nullable(), {
    decode: (str) => (str.trim().length === 0 ? null : str.trim()),
    encode: (maybeStr) => maybeStr ?? '',
  }),
  race: z.codec(z.string(), z.boolean(), {
    decode: (str) => str === 'true',
    encode: (b) => (b ? 'true' : 'false'),
  }),
  location: z.string(),
  subtitle: z.string(),
  timeStart: z.codec(z.string(), ISOTimeSchema.nullable(), {
    decode: (maybeStr) => (maybeStr ? ISOTimeSchema.decode(maybeStr) : null),
    encode: (maybeISOTime) => maybeISOTime ?? '',
  }),
  title: z.string().trim().min(1),
  eventType: EventTypeEnum,
  includeEventCreator: z.codec(z.string(), z.boolean(), {
    decode: (str) => str === 'true',
    encode: (b) => (b ? 'true' : 'false'),
  }),
})
