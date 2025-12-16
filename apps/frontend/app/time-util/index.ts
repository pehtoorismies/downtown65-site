import { format } from 'date-fns'
import { isValid, parse } from 'date-fns/fp'
import { pipe } from 'remeda'
import { z } from 'zod'

type TimeInput = string | { hours: number; minutes: number }
type DateInput = Date | string

const isValidISODate = (date: string): boolean => {
  const match = date.match(/^\d{4}-\d{2}-\d{2}$/)
  if (match === null) {
    return false
  }

  return pipe(date, isoDateParser, isValid)
}

const isValidISOTime = (time: string) => {
  return time.match(/^([01]\d|2[0-3]):[0-5]\d$/) !== null
}

export const ISOTime = z
  .string()
  .refine((value) => isValidISOTime(value), {
    message: 'String is not formatted as ISOTime',
  })
  .brand<'ISOTime'>()

const padStart = (x: number) => String(x).padStart(2, '0')

export const padTime = (x: number): string => {
  if (x < 10) {
    return String(x).padStart(2, '0')
  }
  return String(x)
}

const isoDateParser = parse(new Date(), 'yyyy-MM-dd')

const getDateAsString = (date: DateInput) => {
  if (typeof date === 'string') {
    return date
  }

  if (isValid(date)) {
    return format(date, 'yyyy-MM-dd')
  }
  return 'not valid date'
}

export const ISODate = z
  .string()
  .refine((value) => isValidISODate(value), {
    message: 'String is not formatted as ISODate',
  })
  .brand<'ISODate'>()

export const toISODate = (date: DateInput) => {
  const d = getDateAsString(date)
  return ISODate.safeParse(d)
}

const toTimeFormat = (hours: number, minutes: number) =>
  `${padStart(hours)}:${padStart(minutes)}`

const getTimeAsString = (time: TimeInput) => {
  if (typeof time === 'string') {
    return time
  }
  return toTimeFormat(time.hours, time.minutes)
}

export const toISOTime = (time: TimeInput) => {
  const t = getTimeAsString(time)
  return ISOTime.safeParse(t)
}
