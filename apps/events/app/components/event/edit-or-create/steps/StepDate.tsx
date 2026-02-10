import 'dayjs/locale/fi'
import { Group } from '@mantine/core'
import type { DateValue } from '@mantine/dates'
import { DatePicker } from '@mantine/dates'
import { useMediaQuery } from '@mantine/hooks'
import { format } from 'date-fns'
import type { ReducerProps } from '../reducer'
import { NextButton, PreviousButton, StepLayout } from './LayoutSteps'

export const StepDate = ({ state, dispatch }: ReducerProps) => {
  const matches = useMediaQuery('(max-width: 48em)', true, {
    getInitialValueInEffect: false,
  })

  const size = matches ? 'sm' : 'lg'

  const previousButton = (
    <PreviousButton onClick={() => dispatch({ kind: 'previousStep' })}>
      Perustiedot
    </PreviousButton>
  )
  const nextButton = (
    <NextButton onClick={() => dispatch({ kind: 'nextStep' })}>
      Kellonaika
    </NextButton>
  )

  return (
    <StepLayout
      nextButton={nextButton}
      prevButton={previousButton}
      title={`Päivämäärä: ${format(state.date, 'd.M.yyyy')}`}
    >
      <Group justify="center">
        <DatePicker
          defaultDate={state.date}
          locale="fi"
          minDate={state.kind === 'create' ? new Date() : undefined}
          numberOfColumns={1}
          onChange={(date: DateValue) => {
            if (date == null) {
              throw new Error('Date can not be null')
            }
            if (typeof date === 'string') {
              dispatch({ date: new Date(date), kind: 'date' })
            } else {
              dispatch({ date, kind: 'date' })
            }
          }}
          size={size}
          value={state.date}
        />
      </Group>
    </StepLayout>
  )
}
