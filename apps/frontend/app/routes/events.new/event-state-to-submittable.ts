import { toISODate, toISOTime } from '~/time-util'
import type { EventForm } from './event-form-schema'
import type { EventState } from './event-state'

const getAsISOTime = (time: EventState['time']) => {
  if (time.minutes === undefined || time.hours === undefined) {
    return
  }
  const result = toISOTime({
    hours: time.hours,
    minutes: time.minutes,
  })

  return result.success ? result.data : undefined
}

export const eventStateToSubmittable = (eventState: EventState): EventForm => {
  if (eventState.eventType === undefined) {
    throw new Error('Cannot submit undefined eventType')
  }

  const dateResult = toISODate(eventState.date)
  if (!dateResult.success) {
    throw new Error('Date format is incorrect')
  }

  const timeValue = getAsISOTime(eventState.time)

  return {
    date: dateResult.data,
    description: eventState.description,
    type: eventState.eventType,
    race: eventState.isRace,
    location: eventState.location,
    includeEventCreator: eventState.participants.length > 0,
    subtitle: eventState.subtitle,
    title: eventState.title,
    time: timeValue ?? '',
  }
}
