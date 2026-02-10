import { Button, Center, Grid, Stack, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import type { PropsWithChildren } from 'react'
import { Gradient, GradientInverse } from '~/components/colors'

import type { EventState } from '../event-state'
import type { ReducerProps } from '../reducer'
import { NextButton, PreviousButton, StepLayout } from './LayoutSteps'

const HOURS = [
  [6, 9, 12, 15, 18, 21, 0, 3],
  [7, 10, 13, 16, 19, 22, 1, 4],
  [8, 11, 14, 17, 20, 23, 2, 5],
]

const MINUTES = [
  [0, 10, 20, 30, 40, 50],
  [5, 15, 25, 35, 45, 55],
]

const getHourGradient = (currentValue: number, value?: number) => {
  if (value === currentValue) {
    return Gradient.dtPink
  }
  return { deg: 45, from: 'blue.5', to: 'blue.5' }
}

const getMinuteGradient = (currentValue: number, value?: number) => {
  if (value === currentValue) {
    return GradientInverse.dtPink
  }
  return { deg: 45, from: 'violet.5', to: 'violet.5' }
}

const getTime = ({ time }: EventState): string => {
  if (time.hours !== undefined && time.minutes !== undefined) {
    return `: ${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`
  }
  if (time.hours !== undefined) {
    return `: ${String(time.hours).padStart(2, '0')}:xx`
  }
  return ''
}

const ResponsiveText = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Text hiddenFrom="sm" size="sm">
        {children}
      </Text>
      <Text size="lg" visibleFrom="sm">
        {children}
      </Text>
    </>
  )
}

export const StepTime = ({ state, dispatch }: ReducerProps) => {
  const matches = useMediaQuery('(max-width: 48em)', true, {
    getInitialValueInEffect: false,
  })

  const size = matches ? 'compact-xs' : 'sm'
  const radius = matches ? 'xs' : 'sm'

  const getHoursCol = (hours: number[]) =>
    hours.map((hour) => (
      <Button
        data-testid={`hour-${hour}`}
        gradient={getHourGradient(hour, state.time.hours)}
        key={hour}
        onClick={() => {
          dispatch({
            kind: 'time',
            time: {
              ...state.time,
              hours: hour,
            },
          })
        }}
        radius={radius}
        size={size}
        variant="gradient"
      >
        {String(hour).padStart(2, '0')}
      </Button>
    ))
  const getMinutesCol = (minutes: number[]) =>
    minutes.map((minute) => (
      <Button
        data-testid={`minute-${minute}`}
        disabled={state.time.hours === undefined}
        gradient={getMinuteGradient(minute, state.time.minutes)}
        key={minute}
        onClick={() => {
          dispatch({
            kind: 'time',
            time: {
              ...state.time,
              minutes: minute,
            },
          })
        }}
        radius={radius}
        size={size}
        variant="gradient"
      >
        {String(minute).padStart(2, '0')}
      </Button>
    ))

  const previousButton = (
    <PreviousButton onClick={() => dispatch({ kind: 'previousStep' })}>
      Päivämäärä
    </PreviousButton>
  )
  const nextButton = (
    <NextButton onClick={() => dispatch({ kind: 'nextStep' })}>
      Kuvaus
    </NextButton>
  )

  const gap = matches ? 5 : 'sm'

  return (
    <StepLayout
      nextButton={nextButton}
      prevButton={previousButton}
      title={`Kellonaika${getTime(state)}`}
    >
      <Grid gutter={{ base: 2, sm: 'sm', xs: 2 }} mt="sm">
        <Grid.Col span={6}>
          <ResponsiveText>Tunnit</ResponsiveText>
        </Grid.Col>
        <Grid.Col span={6}>
          <ResponsiveText>Minuutit</ResponsiveText>
        </Grid.Col>
      </Grid>
      <Grid gutter="xs">
        <Grid.Col span={2}>
          <Stack gap={gap}>{getHoursCol(HOURS[0])}</Stack>
        </Grid.Col>
        <Grid.Col span={2}>
          <Stack gap={gap}>{getHoursCol(HOURS[1])}</Stack>
        </Grid.Col>
        <Grid.Col span={2}>
          <Stack gap={gap}>{getHoursCol(HOURS[2])}</Stack>
        </Grid.Col>
        <Grid.Col span={3}>
          <Stack gap={gap}>{getMinutesCol(MINUTES[0])}</Stack>
        </Grid.Col>
        <Grid.Col span={3}>
          <Stack gap={gap}>{getMinutesCol(MINUTES[1])}</Stack>
        </Grid.Col>
      </Grid>
      <Center>
        <Button
          color="red"
          data-testid="clear-time"
          mt="md"
          onClick={() =>
            dispatch({
              kind: 'time',
              time: {
                hours: undefined,
                minutes: undefined,
              },
            })
          }
          size={size}
          variant="outline"
        >
          Tyhjennä aika
        </Button>
      </Center>
    </StepLayout>
  )
}
