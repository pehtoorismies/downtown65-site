import type { ISODate } from '@downtown65/schema'
import { format, parseISO } from 'date-fns'
import { fi } from 'date-fns/locale/fi'

function formatIsoDate(isoStr: string, fmt = 'dd.MM.yyyy'): string {
  const d = parseISO(isoStr)

  return format(d, fmt, {
    locale: fi,
  })
}

interface Props {
  isoDate: ISODate
  format: string
}

export const DateFormat = ({ isoDate, format }: Props) => {
  return formatIsoDate(isoDate, format)
}
