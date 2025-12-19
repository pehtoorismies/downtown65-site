import type { User } from '@downtown65/schema'
import type { Dispatch } from 'react'
import {
  JoinEventButton,
  LeaveEventButton,
} from '~/components/event/EventButtons'
import { useParticipants } from '~/components/participants/use-participants'
import type { EventAction } from '../reducer'

interface EventButtonProps {
  participants: { id: number }[]
  me: User
  dispatch: Dispatch<EventAction>
}

export const EventButtonContainer = (props: EventButtonProps) => {
  const { meAttending } = useParticipants(props.participants, props.me)

  if (meAttending) {
    const leaveEvent = () => {
      props.dispatch({ kind: 'leaveEvent', me: props.me })
    }
    return (
      <LeaveEventButton {...props} onClick={leaveEvent} isLoading={false} />
    )
  }

  const joinEvent = () => {
    props.dispatch({ kind: 'participateEvent', me: props.me })
  }

  return <JoinEventButton {...props} onClick={joinEvent} isLoading={false} />
}
