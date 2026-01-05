import type { Event, ID } from '@downtown65/schema'
import { Divider } from '@mantine/core'
import { IconMedal } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { useParticipants } from '../participants/use-participants'
import { Voucher } from '../voucher/Voucher'
import { EVENT_CARD_LABELS } from './EventCard.constants'
import { EventDescription } from './EventDescription'
import { EventDetails } from './EventDetails'
import { getEventTypeData } from './get-event-type-data'
import { Participants } from './Participants'

interface EventCardProps {
  event: Omit<Event, 'id' | 'eventULID'>
  me: { id: ID } | null
}

export const EventCard = ({
  event,
  me,
  children,
}: PropsWithChildren<EventCardProps>) => {
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
        <EventDetails
          subtitle={subtitle}
          dateStart={dateStart}
          timeStart={timeStart}
          location={location}
        >
          {children}
        </EventDetails>
        <Divider
          my="xs"
          label={EVENT_CARD_LABELS.participants}
          labelPosition="center"
        />
        <Participants participants={participants} me={me} />
        <EventDescription description={description} />
      </Voucher.Content>
    </Voucher>
  )
}
