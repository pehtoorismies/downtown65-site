import { EVENT_TYPES } from '@downtown65/schema'
import { Button, SimpleGrid } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { Gradient } from '~/components/colors'
import { getEventTypeData } from '~/components/event/get-event-type-data'
import type { ReducerProps } from '../reducer'
import { NextButton, StepLayout } from './LayoutSteps'

export const StepType = ({ state, dispatch }: ReducerProps) => {
  const matches = useMediaQuery('(max-width: 48em)', true, {
    getInitialValueInEffect: false,
  })
  const size = matches ? 'xs' : 'sm'

  const buttons = EVENT_TYPES.map((v) => {
    return {
      type: v,
      ...getEventTypeData(v),
    }
  })
    .sort((a, b) => {
      const aValue = a.eventText.toLowerCase()
      const bValue = b.eventText.toLowerCase()
      if (aValue < bValue) {
        return -1
      }
      if (bValue < aValue) {
        return 1
      }
      return 0
    })
    .map(({ eventText, type, icon: TypeIcon }) => {
      console.warn(TypeIcon)

      return (
        <Button
          data-testid={
            state.eventType === type
              ? `button-${type}-selected`
              : `button-${type}`
          }
          color={state.eventType === type ? 'dtPink' : 'blue'}
          key={type}
          onClick={() => {
            dispatch({ kind: 'type', type })
          }}
          leftSection={<TypeIcon size={20} />}
          rightSection={<span />}
          justify="space-between"
          variant="gradient"
          size={size}
          gradient={
            state.eventType === type
              ? Gradient.dtPink
              : {
                  from: 'indigo',
                  to: 'cyan',
                  deg: 45,
                }
          }
        >
          {eventText}
        </Button>
      )
    })

  const nextButton = state.eventType ? (
    <NextButton onClick={() => dispatch({ kind: 'nextStep' })}>
      Perustiedot
    </NextButton>
  ) : null

  return (
    <StepLayout prevButton={null} nextButton={nextButton} title="Laji">
      <SimpleGrid cols={2} spacing={{ base: 'xs', sm: 'md' }}>
        {buttons}
      </SimpleGrid>
    </StepLayout>
  )
}
