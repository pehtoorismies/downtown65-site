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
    <Grid align="center" my={2} gutter="xs">
      <Grid.Col span={7}>
        <Text fw={700} mt={2} data-testid="event-subtitle">
          {subtitle}
        </Text>
        <Text size="sm" fw={500} data-testid="event-date">
          <DateFormat isoDate={dateStart} format="d.M.yyyy" /> {time}
        </Text>
        <Text size="sm" c="dimmed" fw={400} data-testid="event-location">
          {location}
        </Text>
      </Grid.Col>
      <Grid.Col span={5}>
        <Group justify="end">{children}</Group>
      </Grid.Col>
    </Grid>
  )
}
