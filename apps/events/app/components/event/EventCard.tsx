import type { Event, ID } from '@downtown65/schema'
import { Divider } from '@mantine/core'
import type { PropsWithChildren } from 'react'
import { useParticipants } from '../participants/use-participants'
import { Voucher } from '../voucher/Voucher'
import { EVENT_CARD_LABELS } from './EventCard.constants'
import { EventDescription } from './EventDescription'
import { EventDetails } from './EventDetails'
import { EventHeader } from './EventHeader'
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
      <EventHeader
        title={title}
        eventText={eventText}
        imageUrl={imageUrl}
        creatorNickname={createdBy.nickname}
        count={count}
        meAttending={meAttending}
        race={race}
      />
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
