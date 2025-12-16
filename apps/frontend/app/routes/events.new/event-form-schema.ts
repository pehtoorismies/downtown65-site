import { EventTypeEnum } from '@downtown65/schema'
import z from 'zod'

const preprocessEmptyString = (value: unknown) => {
  if (typeof value === 'string' && value.length === 0) {
    return undefined
  }
  return value
}

export const EventFormSchema = z.object({
  date: z.iso.date(),
  description: z.preprocess(
    preprocessEmptyString,
    z.string().trim().optional(),
  ),
  race: z.stringbool(),
  location: z.string(),
  subtitle: z.string(),
  time: z.preprocess(
    preprocessEmptyString,
    z.iso.time({ precision: -1 }).optional(),
  ),
  title: z.string().trim().min(1),
  type: EventTypeEnum,
  includeEventCreator: z.stringbool(),
})

export type EventForm = z.infer<typeof EventFormSchema>
