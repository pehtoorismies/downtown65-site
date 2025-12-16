import type { EventType } from '@downtown65/schema'
import { Button, Grid, Group, Text } from '@mantine/core'

import { IconArrowNarrowRight, IconMedal } from '@tabler/icons-react'
import { Link } from 'react-router'
import { getEventTypeData } from '~/components/event/get-event-type-data'
import { useParticipants } from '~/components/participants/use-participants'

import { Voucher } from '~/components/voucher/Voucher'

interface Props {
  id: number
  eventULID: string
  title: string
  race: boolean
  subtitle: string
  location: string
  type: EventType
  createdBy: {
    nickname: string
  }
  participants: { id: number }[]
  dateStart: string
  timeStart?: string | null
  me: { id: number }
}

export const ListEventCard = ({
  eventULID,
  title,
  race,
  subtitle,
  location,
  type,
  createdBy,
  participants,
  dateStart,
  timeStart,
  me,
}: Props) => {
  const { meAttending, count } = useParticipants(participants, me)

  const time = timeStart ? `klo ${timeStart}` : ''

  return (
    <Voucher>
      <Voucher.Header bgImageUrl={getEventTypeData(type).imageUrl}>
        <Voucher.Header.Title>{title}</Voucher.Header.Title>
        <Voucher.Header.ParticipantCount
          count={count}
          highlighted={meAttending}
        />
        <Voucher.Header.Creator>{createdBy.nickname}</Voucher.Header.Creator>
        <Voucher.Header.Type>
          {getEventTypeData(type).eventText}
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
              {dateStart} {time}
            </Text>
            <Text size="sm" c="dimmed" fw={400} data-testid="event-location">
              {location}
            </Text>
          </Grid.Col>
          <Grid.Col span={5}>
            <Group justify="end">
              <Button>TODO</Button>
            </Group>
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
