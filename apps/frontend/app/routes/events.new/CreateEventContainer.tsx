import type { User } from '@downtown65/schema'
import { Container, Stepper } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconAlignLeft,
  IconCalendar,
  IconClockHour5,
  IconEdit,
  IconRocket,
  IconRun,
} from '@tabler/icons-react'
import type { Dispatch, FC } from 'react'
import { useFetcher } from 'react-router'
import type { EventState } from './event-state'
import { toSubmittable } from './event-state-to-submittable'
import type { EventAction } from './reducer'
import { isStepNumber } from './reducer'
import { StepDate } from './steps/StepDate'
import { StepDescription } from './steps/StepDescription'
import { StepPreview } from './steps/StepPreview'
import { StepTime } from './steps/StepTime'
import { StepTitle } from './steps/StepTitle'
import { StepType } from './steps/StepType'

interface Props {
  state: EventState
  dispatch: Dispatch<EventAction>
  me: User
  cancelRedirectPath: string
}

export const CreateEventContainer: FC<Props> = ({ state, me, dispatch }) => {
  const fetcher = useFetcher()
  const matches = useMediaQuery('(max-width: 48em)', true, {
    getInitialValueInEffect: false,
  })

  const iconSize = matches ? 18 : 34

  const submit = () => {
    fetcher.submit(toSubmittable(state), {
      method: 'post',
    })
  }

  return (
    <Container p={{ base: 1, sm: 'xs' }}>
      <Stepper
        allowNextStepsSelect={false}
        color={state.kind === 'edit' ? 'dtPink.4' : 'blue'}
        iconSize={iconSize}
        active={state.activeStep}
        onStepClick={(stepIndex: number) => {
          if (!isStepNumber(stepIndex)) {
            throw new Error('Not in step range')
          }
          dispatch({ kind: 'step', step: stepIndex })
        }}
      >
        <Stepper.Step icon={<IconRun />} data-testid="step-type">
          <StepType state={state} dispatch={dispatch} />
        </Stepper.Step>
        <Stepper.Step icon={<IconEdit />} data-testid="step-basic-info">
          <StepTitle state={state} dispatch={dispatch} />
        </Stepper.Step>
        <Stepper.Step icon={<IconCalendar />} data-testid="step-date">
          <StepDate state={state} dispatch={dispatch} />
        </Stepper.Step>
        <Stepper.Step icon={<IconClockHour5 />} data-testid="step-time">
          <StepTime state={state} dispatch={dispatch} />
        </Stepper.Step>
        <Stepper.Step icon={<IconAlignLeft />} data-testid="step-description">
          <StepDescription state={state} dispatch={dispatch} />
        </Stepper.Step>
        <Stepper.Step icon={<IconRocket />} data-testid="step-preview">
          <StepPreview
            state={state}
            me={me}
            dispatch={dispatch}
            submit={submit}
            submitState={fetcher.state}
          />
        </Stepper.Step>
      </Stepper>
    </Container>
  )
}
