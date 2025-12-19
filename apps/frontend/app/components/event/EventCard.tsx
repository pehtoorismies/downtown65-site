import type { Event, ID } from '@downtown65/schema'
import { Divider, Grid, Group, Text, Typography } from '@mantine/core'
import { IconMedal } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { useParticipants } from '../participants/use-participants'
import { Voucher } from '../voucher/Voucher'
import { getEventTypeData } from './get-event-type-data'
import { Participants } from './Participants'

interface Props {
  event: Omit<Event, 'id' | 'eventULID'>
  me: { id: ID } | null
}

const getDescription = (description: string | null) => {
  if (description && description.trim().length > 0) {
    return description.trim()
  }
}

export const EventCard = ({
  event,
  me,
  children,
}: PropsWithChildren<Props>) => {
  const {
    title,
    race,
    subtitle,
    location,
    eventType,
    createdBy,
    participants,
    dateStart,
    timeStart,
    description,
  } = event

  const { count, meAttending } = useParticipants(participants, me)

  const time = timeStart ? `klo ${timeStart}` : ''
  const descriptionText = getDescription(description)

  const formattedDate = time.length === 0 ? dateStart : `${dateStart} ${time}`

  const { eventText, imageUrl } = getEventTypeData(eventType)

  return (
    <Voucher>
      <Voucher.Header bgImageUrl={imageUrl}>
        <Voucher.Header.Title>{title}</Voucher.Header.Title>
        <Voucher.Header.ParticipantCount
          count={count}
          highlighted={meAttending}
        />
        <Voucher.Header.Type>{eventText}</Voucher.Header.Type>
        <Voucher.Header.Creator>{createdBy.nickname}</Voucher.Header.Creator>
        {race && <Voucher.Header.Icon icon={<IconMedal color="white" />} />}
      </Voucher.Header>
      <Voucher.Content>
        <Grid align="center" my={2} gutter="xs">
          <Grid.Col span={7}>
            <Text fw={700} mt={2} data-testid="event-subtitle">
              {subtitle}
            </Text>
            <Text size="sm" fw={500} data-testid="event-date">
              {formattedDate}
            </Text>
            <Text size="sm" c="dimmed" fw={400} data-testid="event-location">
              {location}
            </Text>
          </Grid.Col>
          <Grid.Col span={5}>
            <Group justify="end">{children}</Group>
          </Grid.Col>
        </Grid>
        <Divider my="xs" label="Osallistujat" labelPosition="center" />
        <Participants participants={participants} me={me} />
        <Divider my="xs" label="Lisätiedot" labelPosition="center" />
        {descriptionText ? (
          <Typography p={0} mt="sm">
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Fix later */}
            <div dangerouslySetInnerHTML={{ __html: descriptionText }} />
          </Typography>
        ) : (
          <Text ta="center" p="sm" c="dimmed" fw={400}>
            ei tarkempaa tapahtuman kuvausta
          </Text>
        )}
      </Voucher.Content>
    </Voucher>
  )
}
