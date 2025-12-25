import { useFetcher } from 'react-router'
import {
  JoinEventButton,
  LeaveEventButton,
  ToLoginButton,
} from '~/components/event/EventButtons'
import { useParticipants } from '~/components/participants/use-participants'

interface EventButtonProps {
  participants: { id: number }[]
  me: { id: number } | null
  eventId: number
}

export const EventButtonContainer = (props: EventButtonProps) => {
  const { meAttending } = useParticipants(props.participants, props.me)
  const fetcher = useFetcher()

  if (!props.me) {
    return <ToLoginButton />
  }

  const isLoading =
    fetcher.state === 'loading' || fetcher.state === 'submitting'

  if (meAttending) {
    const leaveEvent = () => {
      fetcher.submit(
        {},
        {
          action: `/events/${props.eventId}/participation`,
          method: 'DELETE',
        },
      )
    }
    return (
      <LeaveEventButton {...props} onClick={leaveEvent} isLoading={isLoading} />
    )
  }

  const joinEvent = () => {
    fetcher.submit(
      {},
      {
        action: `/events/${props.eventId}/participation`,
        method: 'POST',
      },
    )
  }

  return (
    <JoinEventButton {...props} onClick={joinEvent} isLoading={isLoading} />
  )
}
