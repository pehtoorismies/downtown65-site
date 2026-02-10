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
        count={count}
        creatorNickname={createdBy.nickname}
        eventText={eventText}
        imageUrl={imageUrl}
        meAttending={meAttending}
        race={race}
        title={title}
      />
      <Voucher.Content>
        <EventDetails
          dateStart={dateStart}
          location={location}
          subtitle={subtitle}
          timeStart={timeStart}
        >
          {children}
        </EventDetails>
        <Divider
          label={EVENT_CARD_LABELS.participants}
          labelPosition="center"
          my="xs"
        />
        <Participants me={me} participants={participants} />
        <EventDescription description={description} />
      </Voucher.Content>
    </Voucher>
  )
}
