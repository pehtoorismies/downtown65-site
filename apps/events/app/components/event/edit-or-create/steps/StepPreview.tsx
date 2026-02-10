import { ISODateSchema, ISOTimeSchema, type User } from '@downtown65/schema'
import { IconDeviceFloppy, IconRocket } from '@tabler/icons-react'
import { Gradient } from '~/components/colors'
import { EventCard } from '~/components/event/EventCard'
import type { EventState } from '../event-state'
import type { ReducerProps } from '../reducer'
import { EventButtonContainer } from './EventButtonContainer'
import { NextButton, PreviousButton, StepLayout } from './LayoutSteps'

interface Properties extends ReducerProps {
  me: User
  submit: () => void
  submitState: 'idle' | 'submitting' | 'loading'
}

const getDate = (date: EventState['date']) => {
  return ISODateSchema.parse(date.toISOString().slice(0, 10))
}

const getTime = ({ hours, minutes }: EventState['time']) => {
  if (hours !== undefined && minutes !== undefined) {
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    return ISOTimeSchema.parse(time)
  }
  return null
}

const getButtonProps = (
  kind: EventState['kind'],
): { text: string; icon: React.ReactNode } => {
  switch (kind) {
    case 'create': {
      return { icon: <IconRocket size={18} />, text: 'Luo tapahtuma' }
    }
    case 'edit': {
      return { icon: <IconDeviceFloppy size={18} />, text: 'Tallenna' }
    }
  }
}

export const StepPreview = ({
  state,
  me,
  dispatch,
  submit,
  submitState,
}: Properties) => {
  if (!state.eventType) {
    throw new Error('Illegal state, not eventType defined')
  }

  const previousButton = (
    <PreviousButton onClick={() => dispatch({ kind: 'previousStep' })}>
      Kuvaus
    </PreviousButton>
  )

  const { text, icon } = getButtonProps(state.kind)

  const nextButton = (
    <NextButton
      gradient={Gradient.dtPink}
      loading={submitState !== 'idle'}
      onClick={submit}
      rightSection={icon}
      variant="gradient"
    >
      {text}
    </NextButton>
  )

  return (
    <StepLayout
      nextButton={nextButton}
      prevButton={previousButton}
      title="Esikatselu"
    >
      <EventCard
        event={{
          ...state,
          createdBy: me,
          dateStart: getDate(state.date),
          eventType: state.eventType,
          participants: state.participants,
          race: state.isRace,
          timeStart: getTime(state.time),
        }}
        me={me}
      >
        <EventButtonContainer
          dispatch={dispatch}
          me={me}
          participants={state.participants}
        />
      </EventCard>
    </StepLayout>
  )
}
