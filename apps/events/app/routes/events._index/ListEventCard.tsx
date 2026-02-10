import type { Event } from '@downtown65/schema'
import { Button } from '@mantine/core'
import { IconArrowNarrowRight } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import { EventDetails } from '~/components/event/EventDetails'
import { EventHeader } from '~/components/event/EventHeader'
import { getEventTypeData } from '~/components/event/get-event-type-data'
import { useParticipants } from '~/components/participants/use-participants'
import { Voucher } from '~/components/voucher/Voucher'

const VIEW_MORE_TEXT = 'Näytä lisää'

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
    id,
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
        <Button
          component={Link}
          fullWidth
          my="xs"
          rightSection={<IconArrowNarrowRight size={18} />}
          size="compact-sm"
          to={`/events/${id}`}
          variant="subtle"
        >
          {VIEW_MORE_TEXT}
        </Button>
      </Voucher.Content>
    </Voucher>
  )
}
