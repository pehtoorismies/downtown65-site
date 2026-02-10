import type { User } from '@downtown65/schema'
import { Stepper } from '@mantine/core'
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
import { StepEventType } from './steps/StepEventType'
import { StepPreview } from './steps/StepPreview'
import { StepTime } from './steps/StepTime'
import { StepTitle } from './steps/StepTitle'

interface Props {
  state: EventState
  dispatch: Dispatch<EventAction>
  me: User
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
    <Stepper
      active={state.activeStep}
      allowNextStepsSelect={false}
      color={state.kind === 'edit' ? 'dtPink.4' : 'blue'}
      iconSize={iconSize}
      onStepClick={(stepIndex: number) => {
        if (!isStepNumber(stepIndex)) {
          throw new Error('Not in step range')
        }
        dispatch({ kind: 'step', step: stepIndex })
      }}
    >
      <Stepper.Step data-testid="step-type" icon={<IconRun />}>
        <StepEventType dispatch={dispatch} state={state} />
      </Stepper.Step>
      <Stepper.Step data-testid="step-basic-info" icon={<IconEdit />}>
        <StepTitle dispatch={dispatch} state={state} />
      </Stepper.Step>
      <Stepper.Step data-testid="step-date" icon={<IconCalendar />}>
        <StepDate dispatch={dispatch} state={state} />
      </Stepper.Step>
      <Stepper.Step data-testid="step-time" icon={<IconClockHour5 />}>
        <StepTime dispatch={dispatch} state={state} />
      </Stepper.Step>
      <Stepper.Step data-testid="step-description" icon={<IconAlignLeft />}>
        <StepDescription dispatch={dispatch} state={state} />
      </Stepper.Step>
      <Stepper.Step data-testid="step-preview" icon={<IconRocket />}>
        <StepPreview
          dispatch={dispatch}
          me={me}
          state={state}
          submit={submit}
          submitState={fetcher.state}
        />
      </Stepper.Step>
    </Stepper>
  )
}
