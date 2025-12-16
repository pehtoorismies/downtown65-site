import { EventTypeEnum, ISODateSchema } from '@downtown65/schema'
import z from 'zod'
import { ISOTime } from '~/time-util'

const preprocessEmptyString = (value: unknown) => {
  if (typeof value === 'string' && value.length === 0) {
    return undefined
  }
  return value
}

export const EventFormSchema = z.object({
  date: ISODateSchema,
  description: z.preprocess(
    preprocessEmptyString,
    z.string().trim().optional(),
  ),
  race: z.stringbool(),
  location: z.string(),
  subtitle: z.string(),
  time: z.preprocess(preprocessEmptyString, ISOTime.optional()),
  title: z.string().trim().min(1),
  type: EventTypeEnum,
  includeEventCreator: z.stringbool(),
})

export type EventForm = z.infer<typeof EventFormSchema>
