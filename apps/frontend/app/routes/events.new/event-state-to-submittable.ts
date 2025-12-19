import { ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import z from 'zod'
import type { EventForm } from './event-form-schema'
import type { EventState } from './event-state'

const DateToISODateSchema = z
  .date() // validate it's a Date first
  .transform((d) => {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })
  .pipe(ISODateSchema)

const toTimeFormat = (hours: number, minutes: number) =>
  `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

const getAsISOTime = (time: EventState['time']) => {
  if (time.minutes === undefined || time.hours === undefined) {
    return null
  }

  const t = toTimeFormat(time.hours, time.minutes)
  ISOTimeSchema.safeParse(t)
  const result = ISOTimeSchema.safeParse(t)

  return result.success ? result.data : null
}

export const toSubmittable = (eventState: EventState): EventForm => {
  if (eventState.eventType === undefined) {
    throw new Error('Cannot submit undefined eventType')
  }

  const dateResult = DateToISODateSchema.safeParse(eventState.date)
  if (!dateResult.success) {
    throw new Error('Date format is incorrect')
  }

  const timeValue = getAsISOTime(eventState.time)

  return {
    dateStart: dateResult.data,
    description: eventState.description,
    eventType: eventState.eventType,
    race: eventState.isRace,
    location: eventState.location,
    includeEventCreator: eventState.participants.length > 0,
    subtitle: eventState.subtitle,
    title: eventState.title,
    timeStart: timeValue,
  }
}
