import type { Event } from '@downtown65/schema'
import { Button, Grid, Group, Text } from '@mantine/core'
import { IconArrowNarrowRight, IconMedal } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import { DateFormat } from '~/components/event/DateFormat'
import { getEventTypeData } from '~/components/event/get-event-type-data'
import { useParticipants } from '~/components/participants/use-participants'
import { Voucher } from '~/components/voucher/Voucher'

interface Props {
  event: Event
  me: { id: number }
}

export const ListEventCard = ({
  event,
  me,
  children,
}: PropsWithChildren<Props>) => {
  const {
    eventULID,
    title,
    race,
    subtitle,
    location,
    eventType,
    createdBy,
    participants,
    dateStart,
    timeStart,
  } = event

  const { meAttending, count } = useParticipants(participants, me)

  const time = timeStart ? `klo ${timeStart}` : ''

  return (
    <Voucher>
      <Voucher.Header bgImageUrl={getEventTypeData(eventType).imageUrl}>
        <Voucher.Header.Title>{title}</Voucher.Header.Title>
        <Voucher.Header.ParticipantCount
          count={count}
          highlighted={meAttending}
        />
        <Voucher.Header.Creator>{createdBy.nickname}</Voucher.Header.Creator>
        <Voucher.Header.Type>
          {getEventTypeData(eventType).eventText}
        </Voucher.Header.Type>
        {race && <Voucher.Header.Icon icon={<IconMedal color="white" />} />}
      </Voucher.Header>
      <Voucher.Content>
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
        <Button
          component={Link}
          to={`/events/${eventULID}`}
          fullWidth
          my="xs"
          size="compact-sm"
          rightSection={<IconArrowNarrowRight size={18} />}
          variant="subtle"
        >
          Näytä lisää
        </Button>
      </Voucher.Content>
    </Voucher>
  )
}
