import type { ISODate, ISOTime } from '@downtown65/schema'
import { Grid, Group, Text } from '@mantine/core'
import type { PropsWithChildren } from 'react'
import { DateFormat } from './DateFormat'

interface EventDetailsProps extends PropsWithChildren {
  subtitle: string
  dateStart: ISODate
  timeStart: ISOTime | null
  location: string
}

export const EventDetails = ({
  subtitle,
  dateStart,
  timeStart,
  location,
  children,
}: EventDetailsProps) => {
  const time = timeStart ? `klo ${timeStart}` : ''

  return (
    <Grid align="center" gutter="xs" my={2}>
      <Grid.Col span={7}>
        <Text data-testid="event-subtitle" fw={700} mt={2}>
          {subtitle}
        </Text>
        <Text data-testid="event-date" fw={500} size="sm">
          <DateFormat format="d.M.yyyy" isoDate={dateStart} /> {time}
        </Text>
        <Text c="dimmed" data-testid="event-location" fw={400} size="sm">
          {location}
        </Text>
      </Grid.Col>
      <Grid.Col span={5}>
        <Group justify="end">{children}</Group>
      </Grid.Col>
    </Grid>
  )
}
