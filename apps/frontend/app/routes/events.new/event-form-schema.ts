import { EventTypeEnum, ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import z from 'zod'

const preprocessEmptyString = (value: unknown) => {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return null
  }
  return trimmed
}

export const EventFormSchema = z.object({
  dateStart: ISODateSchema,
  description: z.preprocess(
    preprocessEmptyString,
    z.string().trim().nullable(),
  ),
  race: z.stringbool(),
  location: z.string(),
  subtitle: z.string(),
  timeStart: z.preprocess(preprocessEmptyString, ISOTimeSchema.nullable()),
  title: z.string().trim().min(1),
  eventType: EventTypeEnum,
  includeEventCreator: z.stringbool(),
})

export type EventForm = z.infer<typeof EventFormSchema>
